"""
Surveillance server — bridges the analytics engine to the web dashboard.

Endpoints
---------
    GET  /video_feed    MJPEG stream of annotated frames  (use in <img>)
    GET  /status        JSON: counts, alert state, event log, zone
    POST /start         {"source": 0 | "clip.mp4" | "rtsp://..."}
    POST /stop          release the source
    POST /zone          {"points": [[x,y], ...]} normalised 0..1
    POST /config        {"confidence": 0.35, "loiter": 5}
    GET  /health        liveness check

The RTSP source is the point of the whole exercise: it is how the platform
attaches to CCTV cameras that are already installed, with no new hardware.
A webcam and a video file use the identical code path, which is what makes
the demo possible on a laptop.

    pip install flask flask-cors
    py surveillance_server.py
"""

import threading
import time

import cv2
from flask import Flask, Response, jsonify, request
from flask_cors import CORS

from border_detector import BorderDetector

app = Flask(__name__)
CORS(app)

JPEG_QUALITY = 80

lock = threading.Lock()
state = {
    "running": False,
    "source": None,
    "source_error": None,
    "alerting": False,
    "persons": 0,
    "vehicles": 0,
    "intruders": 0,
    "tracked": 0,
    "faces": 0,
    "plates": 0,
    "night_mode": False,
    "luma": 0.0,
    "night_setting": "auto",
    "fps": 0.0,
    "confidence": 0.35,
    "loiter": 5.0,
}
latest_jpeg = None

detector = None
capture = None


def _ensure_detector():
    global detector
    if detector is None:
        print("[server] loading analytics engine...")
        detector = BorderDetector()
        print("[server] ready")
    return detector


def _open_source(source):
    """Accepts a camera index, a file path, or an RTSP/HTTP stream URL."""
    import platform
    if isinstance(source, str) and source.isdigit():
        source = int(source)

    if isinstance(source, int):
        backend = cv2.CAP_DSHOW if platform.system() == "Windows" else 0
        cap = cv2.VideoCapture(source, backend)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    else:
        cap = cv2.VideoCapture(source)
        # keep latency low on live streams; harmless on files
        try:
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 2)
        except Exception:
            pass
    return cap


def _loop():
    global latest_jpeg, capture
    t0, count = time.time(), 0
    is_file = isinstance(state["source"], str) and \
        not str(state["source"]).lower().startswith(("rtsp://", "http://", "https://"))

    while state["running"]:
        ok, frame = capture.read()
        if not ok:
            if is_file:
                # loop recorded footage so the demo never runs dry
                capture.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            with lock:
                state["source_error"] = "source stopped returning frames"
            break

        if frame.shape[1] > 960:
            scale = 960 / frame.shape[1]
            frame = cv2.resize(frame, None, fx=scale, fy=scale)

        annotated, summary = detector.process_frame(frame)

        ok, buf = cv2.imencode(".jpg", annotated,
                               [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY])
        if ok:
            with lock:
                latest_jpeg = buf.tobytes()

        count += 1
        if time.time() - t0 >= 1.0:
            with lock:
                state["fps"] = round(count / (time.time() - t0), 1)
            t0, count = time.time(), 0

        with lock:
            state.update({
                "alerting": summary["alerting"],
                "persons": summary["persons"],
                "vehicles": summary["vehicles"],
                "intruders": summary["intruders"],
                "tracked": summary["tracked"],
                "faces": summary["faces"],
                "plates": summary["plates"],
                "night_mode": summary["night_mode"],
                "luma": summary["luma"],
            })

    with lock:
        state["running"] = False


# ------------------------------------------------------------------ routes
@app.route("/health")
def health():
    return jsonify(ok=True)


@app.route("/start", methods=["POST"])
def start():
    global capture

    if state["running"]:
        return jsonify(ok=True, message="already running")

    data = request.get_json(silent=True) or {}
    source = data.get("source", 0)

    try:
        _ensure_detector()
    except Exception as e:
        return jsonify(ok=False, error=f"engine failed to load: {e}"), 500

    capture = _open_source(source)
    if not capture.isOpened():
        msg = (f"could not open source '{source}' — for a webcam try 0 or 1; "
               f"for CCTV check the RTSP URL and credentials")
        with lock:
            state["source_error"] = msg
        return jsonify(ok=False, error=msg), 500

    detector.tracker = type(detector.tracker)()   # reset track IDs
    detector.events.clear()

    with lock:
        state["running"] = True
        state["source"] = source
        state["source_error"] = None

    threading.Thread(target=_loop, daemon=True).start()
    return jsonify(ok=True, source=str(source))


@app.route("/stop", methods=["POST"])
def stop():
    global capture
    with lock:
        state["running"] = False
    time.sleep(0.3)
    if capture:
        capture.release()
        capture = None
    return jsonify(ok=True)


@app.route("/status")
def status():
    with lock:
        payload = dict(state)
    payload["events"] = list(detector.events) if detector else []
    payload["zone"] = detector.zone_norm if detector else []
    return jsonify(payload)


@app.route("/zone", methods=["POST"])
def set_zone():
    data = request.get_json(silent=True) or {}
    points = data.get("points") or []
    if not detector:
        return jsonify(ok=False, error="engine not started"), 400
    if not detector.set_zone(points):
        return jsonify(ok=False, error="need at least 3 points"), 400
    return jsonify(ok=True, zone=detector.zone_norm)


@app.route("/config", methods=["POST"])
def config():
    data = request.get_json(silent=True) or {}
    if not detector:
        return jsonify(ok=False, error="engine not started"), 400

    if "confidence" in data:
        v = max(0.05, min(0.95, float(data["confidence"])))
        detector.conf_threshold = v
        with lock:
            state["confidence"] = round(v, 2)

    if "loiter" in data:
        v = max(1.0, min(60.0, float(data["loiter"])))
        detector.loiter_seconds = v
        with lock:
            state["loiter"] = v

    if "night" in data:
        mode = str(data["night"]).lower()
        if mode == "auto":
            detector.night_auto = True
        elif mode in ("on", "off"):
            detector.night_auto = False
            detector.night_mode = (mode == "on")
        with lock:
            state["night_setting"] = mode

    return jsonify(ok=True, confidence=state["confidence"],
                   loiter=state["loiter"], night=state["night_setting"])


def _mjpeg():
    boundary = b"--frame\r\n"
    placeholder = None
    while True:
        with lock:
            frame = latest_jpeg
        if frame is None:
            if placeholder is None:
                import numpy as np
                img = np.full((480, 640, 3), 16, dtype="uint8")
                cv2.putText(img, "NO SIGNAL", (215, 235),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.0, (90, 90, 90), 2)
                cv2.putText(img, "select a source and start the feed",
                            (150, 268), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                            (70, 70, 70), 1)
                placeholder = cv2.imencode(".jpg", img)[1].tobytes()
            frame = placeholder
            time.sleep(0.2)
        yield boundary + b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
        time.sleep(0.04)


@app.route("/video_feed")
def video_feed():
    return Response(_mjpeg(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")


if __name__ == "__main__":
    print("\n  Surveillance server on http://localhost:5000")
    print("  Stream:  http://localhost:5000/video_feed")
    print("  Status:  http://localhost:5000/status\n")
    app.run(host="0.0.0.0", port=5000, threaded=True, debug=False)