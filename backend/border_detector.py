"""
Border Surveillance — Intelligent Video Analytics Core
=======================================================
SIH 2026 · AI-Based Intelligent Video Analytics Platform for Border
Surveillance using existing CCTV Infrastructure.

WHAT THIS DOES
--------------
Takes any video source — an existing CCTV camera over RTSP, a recorded
clip, or a webcam — and runs four analytics on it in real time:

  1. OBJECT DETECTION   persons and vehicles, via YOLOv4-tiny (COCO)
  2. TRACKING           centroid tracker assigns a persistent ID per object
  3. ZONE INTRUSION     alerts when a tracked object enters a restricted
                        polygon the operator defines
  4. LOITERING          alerts when an object stays inside the zone longer
                        than a dwell threshold

WHY THIS DESIGN
---------------
"Using existing CCTV infrastructure" is the core constraint of the problem
statement: the solution must not require new hardware. So this runs entirely
on CPU through OpenCV's DNN module — no GPU, no PyTorch, no TensorFlow. It
consumes a standard RTSP stream, which is what essentially every deployed
CCTV camera already exposes. Measured ~17 fps at 416x416 on a laptop CPU.

The model is pretrained on COCO — 'person', 'car', 'truck', 'motorbike' and
'bus' are all native classes, so no training data or labelling is required.

Author: SIH Team
"""

import os
import math
import time
import platform
import urllib.request
from collections import OrderedDict

import cv2
import numpy as np

# ------------------------------------------------------------------ model
CFG_URL = "https://raw.githubusercontent.com/AlexeyAB/darknet/master/cfg/yolov4-tiny.cfg"
NAMES_URL = "https://raw.githubusercontent.com/AlexeyAB/darknet/master/data/coco.names"
WEIGHTS_URL = ("https://github.com/AlexeyAB/darknet/releases/download/"
               "darknet_yolo_v4_pre/yolov4-tiny.weights")

CFG_PATH = "yolov4-tiny.cfg"
NAMES_PATH = "coco.names"
WEIGHTS_PATH = "yolov4-tiny.weights"

# ------------------------------------------------------------------ config
INPUT_SIZE = 416          # 320 is ~1.6x faster, slightly less accurate
CONF_THRESHOLD = 0.35
NMS_THRESHOLD = 0.45

PERSON_CLASSES = {"person"}
VEHICLE_CLASSES = {"car", "motorbike", "bus", "truck", "bicycle", "boat"}

LOITER_SECONDS = 5.0      # dwell time inside zone before a loitering alert
TRACK_MAX_DISTANCE = 90   # px; how far a centroid may jump between frames
TRACK_MAX_MISSING = 12    # frames an object may vanish before we drop it
ALERT_COOLDOWN = 4.0      # seconds between audible alarms

# --- night-time operation ---
# Border surveillance is substantially a low-light problem. Rather than
# assume good lighting, the platform measures frame luminance and switches
# into an enhanced mode automatically.
NIGHT_LUMA_THRESHOLD = 70     # mean 0-255 below which night mode engages
NIGHT_CLAHE_CLIP = 2.5

# --- suspicious activity ---
RUN_SPEED_PX_PER_SEC = 230    # centroid speed above which movement reads as running
SPEED_HISTORY = 6             # frames of centroid history kept per track

# --- secondary analytics cadence (these are cheap but not free) ---
FACE_EVERY = 3                # run face detection every Nth frame
PLATE_EVERY = 4               # run plate localisation every Nth frame

# Default restricted zone: right-hand 45% of frame, as normalised points.
# The operator redefines this by clicking on the live feed in the dashboard.
DEFAULT_ZONE = [(0.55, 0.05), (0.97, 0.05), (0.97, 0.95), (0.55, 0.95)]

# ------------------------------------------------------------------ audio
if platform.system() == "Windows":
    import winsound

    def _alarm():
        for _ in range(2):
            winsound.Beep(1400, 220)
            winsound.Beep(1000, 220)
else:
    def _alarm():
        print("\a", end="", flush=True)


def alarm():
    """Fire the alert tone without blocking the video pipeline."""
    import threading
    threading.Thread(target=_alarm, daemon=True).start()


def _download(path, url, label):
    if not os.path.exists(path):
        print(f"[model] downloading {label}...")
        urllib.request.urlretrieve(url, path)
        print(f"[model] {label} ready")


# ------------------------------------------------------------------ tracker
class CentroidTracker:
    """Minimal multi-object tracker.

    Detectors are stateless — they see boxes, not objects. Tracking is what
    turns 'a person is visible' into 'person #3 has been in the zone for
    eight seconds', which is what makes loitering and intrusion meaningful
    rather than a stream of duplicate alerts.
    """

    def __init__(self):
        self.next_id = 1
        self.objects = OrderedDict()   # id -> dict(centroid, box, label, ...)
        self.missing = OrderedDict()   # id -> consecutive frames unseen

    def _register(self, centroid, box, label):
        oid = self.next_id
        self.next_id += 1
        self.objects[oid] = {
            "centroid": centroid,
            "box": box,
            "label": label,
            "first_seen": time.time(),
            "in_zone_since": None,
            "alerted": False,
            "loiter_alerted": False,
        }
        self.missing[oid] = 0
        return oid

    def _deregister(self, oid):
        self.objects.pop(oid, None)
        self.missing.pop(oid, None)

    def update(self, detections):
        """detections: list of (box, label). Returns the live object dict."""
        if not detections:
            for oid in list(self.missing):
                self.missing[oid] += 1
                if self.missing[oid] > TRACK_MAX_MISSING:
                    self._deregister(oid)
            return self.objects

        centroids = []
        for (x, y, w, h), _label in detections:
            centroids.append((int(x + w / 2), int(y + h / 2)))

        if not self.objects:
            for (box, label), c in zip(detections, centroids):
                self._register(c, box, label)
            return self.objects

        # greedy nearest-centroid matching — adequate at these object counts
        object_ids = list(self.objects.keys())
        object_centroids = [self.objects[o]["centroid"] for o in object_ids]

        pairs = []
        for i, oc in enumerate(object_centroids):
            for j, dc in enumerate(centroids):
                d = math.dist(oc, dc)
                if d <= TRACK_MAX_DISTANCE:
                    pairs.append((d, i, j))
        pairs.sort()

        used_objects, used_dets = set(), set()
        for _d, i, j in pairs:
            if i in used_objects or j in used_dets:
                continue
            oid = object_ids[i]
            box, label = detections[j]
            self.objects[oid]["centroid"] = centroids[j]
            self.objects[oid]["box"] = box
            self.objects[oid]["label"] = label
            self.missing[oid] = 0
            used_objects.add(i)
            used_dets.add(j)

        for i, oid in enumerate(object_ids):
            if i not in used_objects:
                self.missing[oid] += 1
                if self.missing[oid] > TRACK_MAX_MISSING:
                    self._deregister(oid)

        for j, (box, label) in enumerate(detections):
            if j not in used_dets:
                self._register(centroids[j], box, label)

        return self.objects


# ------------------------------------------------------------------ core
class BorderDetector:
    def __init__(self, zone=None):
        _download(CFG_PATH, CFG_URL, "yolov4-tiny.cfg")
        _download(NAMES_PATH, NAMES_URL, "coco.names")
        _download(WEIGHTS_PATH, WEIGHTS_URL, "yolov4-tiny.weights (24 MB)")

        self.net = cv2.dnn.readNetFromDarknet(CFG_PATH, WEIGHTS_PATH)
        self.out_layers = self.net.getUnconnectedOutLayersNames()
        with open(NAMES_PATH) as f:
            self.classes = [l.strip() for l in f if l.strip()]

        # Secondary analytics use Haar cascades, which ship inside the
        # opencv-python package — no extra download, and they run on CPU in
        # a couple of milliseconds on the small crops we hand them.
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        self.plate_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_russian_plate_number.xml")

        self.tracker = CentroidTracker()
        self.zone_norm = list(zone or DEFAULT_ZONE)
        self.conf_threshold = CONF_THRESHOLD
        self.loiter_seconds = LOITER_SECONDS
        self.last_alarm = 0.0
        self.events = []
        self.frame_count = 0

        self.night_mode = False
        self.night_auto = True
        self.faces = []          # last known face boxes, absolute coords
        self.plates = []         # last known plate boxes, absolute coords
        self._clahe = cv2.createCLAHE(clipLimit=NIGHT_CLAHE_CLIP,
                                      tileGridSize=(8, 8))

    # ---------------- zone ----------------
    def set_zone(self, normalised_points):
        """Points as [(x, y), ...] with x, y in 0..1. Needs 3+ points."""
        if len(normalised_points) >= 3:
            self.zone_norm = [(float(x), float(y)) for x, y in normalised_points]
            return True
        return False

    def _zone_pixels(self, shape):
        h, w = shape[:2]
        return np.array([[int(x * w), int(y * h)] for x, y in self.zone_norm],
                        dtype=np.int32)

    # ---------------- night-time operation ----------------
    def _assess_light(self, frame):
        """Mean luminance of the frame, 0-255."""
        return float(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY).mean())

    def _enhance_night(self, frame):
        """Contrast-limited adaptive histogram equalisation on luminance only.

        Boosting contrast in low light recovers detail the detector would
        otherwise miss, without the colour shift a naive gamma lift causes.
        Applied to the frame the DETECTOR sees as well as the one displayed,
        so the operator sees exactly what the AI is working from.
        """
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        l = self._clahe.apply(l)
        return cv2.cvtColor(cv2.merge((l, a, b)), cv2.COLOR_LAB2BGR)

    # ---------------- secondary analytics ----------------
    def _detect_faces(self, frame, person_boxes):
        """Face detection, restricted to person regions.

        Searching only inside person boxes is both faster and far more
        precise than scanning the whole frame — Haar cascades produce a lot
        of background false positives otherwise.
        """
        found = []
        h, w = frame.shape[:2]
        for (x, y, bw, bh) in person_boxes:
            x1, y1 = max(0, x), max(0, y)
            x2, y2 = min(w, x + bw), min(h, y + int(bh * 0.55))  # upper body
            crop = frame[y1:y2, x1:x2]
            if crop.size == 0 or crop.shape[0] < 40 or crop.shape[1] < 40:
                continue
            grey = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
            grey = cv2.equalizeHist(grey)
            for (fx, fy, fw, fh) in self.face_cascade.detectMultiScale(
                    grey, scaleFactor=1.15, minNeighbors=5, minSize=(24, 24)):
                found.append((x1 + fx, y1 + fy, fw, fh))
        return found

    def _detect_plates(self, frame, vehicle_boxes):
        """Number-plate LOCALISATION inside vehicle regions.

        This finds where the plate is. It does NOT read the characters —
        that requires an OCR engine, which is the honest boundary of what
        this build does. The cropped plate region is what an OCR module
        would consume, so the pipeline is ready for one.
        """
        found = []
        h, w = frame.shape[:2]
        for (x, y, bw, bh) in vehicle_boxes:
            x1, y1 = max(0, x), max(0, y)
            x2, y2 = min(w, x + bw), min(h, y + bh)
            crop = frame[y1:y2, x1:x2]
            if crop.size == 0 or crop.shape[0] < 40 or crop.shape[1] < 60:
                continue
            grey = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
            for (px, py, pw, ph) in self.plate_cascade.detectMultiScale(
                    grey, scaleFactor=1.1, minNeighbors=4, minSize=(40, 12)):
                found.append((x1 + px, y1 + py, pw, ph))
        return found

    def _speed_of(self, obj, now):
        """Centroid speed in px/sec, from short position history."""
        hist = obj.setdefault("history", [])
        hist.append((now, obj["centroid"]))
        del hist[:-SPEED_HISTORY]
        if len(hist) < 2:
            return 0.0
        (t0, c0), (t1, c1) = hist[0], hist[-1]
        dt = t1 - t0
        if dt <= 0:
            return 0.0
        return math.dist(c0, c1) / dt

    # ---------------- detection ----------------
    def detect(self, frame):
        h, w = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(frame, 1 / 255.0, (INPUT_SIZE, INPUT_SIZE),
                                     swapRB=True, crop=False)
        self.net.setInput(blob)
        outputs = self.net.forward(self.out_layers)

        boxes, confidences, class_ids = [], [], []
        for output in outputs:
            for det in output:
                scores = det[5:]
                cid = int(np.argmax(scores))
                conf = float(scores[cid])
                if conf < self.conf_threshold:
                    continue
                name = self.classes[cid]
                if name not in PERSON_CLASSES and name not in VEHICLE_CLASSES:
                    continue
                cx, cy, bw, bh = det[0] * w, det[1] * h, det[2] * w, det[3] * h
                boxes.append([int(cx - bw / 2), int(cy - bh / 2),
                              int(bw), int(bh)])
                confidences.append(conf)
                class_ids.append(cid)

        keep = cv2.dnn.NMSBoxes(boxes, confidences, self.conf_threshold,
                                NMS_THRESHOLD)
        results = []
        if len(keep) > 0:
            for i in np.array(keep).flatten():
                results.append((boxes[i], self.classes[class_ids[i]],
                                confidences[i]))
        return results

    # ---------------- per-frame pipeline ----------------
    def process_frame(self, frame):
        """Returns (annotated_frame, summary_dict)."""
        self.frame_count += 1
        h, w = frame.shape[:2]
        zone = self._zone_pixels(frame.shape)

        # --- night-time operation ---
        luma = self._assess_light(frame)
        if self.night_auto:
            self.night_mode = luma < NIGHT_LUMA_THRESHOLD
        if self.night_mode:
            frame = self._enhance_night(frame)

        detections = self.detect(frame)
        tracked = self.tracker.update([(b, l) for b, l, _c in detections])
        conf_by_box = {tuple(b): c for b, _l, c in detections}

        now = time.time()
        active_alerts = []
        persons = vehicles = 0
        intruders = 0

        person_boxes = [o["box"] for o in tracked.values()
                        if o["label"] in PERSON_CLASSES]
        vehicle_boxes = [o["box"] for o in tracked.values()
                         if o["label"] in VEHICLE_CLASSES]

        # --- face detection (requirement: face detection) ---
        if person_boxes and self.frame_count % FACE_EVERY == 0:
            self.faces = self._detect_faces(frame, person_boxes)
        elif not person_boxes:
            self.faces = []

        # --- plate localisation (requirement: ANPR, detection stage) ---
        if vehicle_boxes and self.frame_count % PLATE_EVERY == 0:
            self.plates = self._detect_plates(frame, vehicle_boxes)
        elif not vehicle_boxes:
            self.plates = []

        for oid, obj in list(tracked.items()):
            label = obj["label"]
            if label in PERSON_CLASSES:
                persons += 1
            else:
                vehicles += 1

            # --- suspicious activity: abnormal speed ---
            speed = self._speed_of(obj, now)
            obj["speed"] = speed
            if (label in PERSON_CLASSES and speed > RUN_SPEED_PX_PER_SEC
                    and not obj.get("run_alerted")):
                obj["run_alerted"] = True
                self._record_event("SUSPICIOUS", label, oid, "MEDIUM", 0.0,
                                   extra=f"rapid movement {int(speed)} px/s")
                active_alerts.append("SUSPICIOUS")

            inside = cv2.pointPolygonTest(
                zone, (float(obj["centroid"][0]), float(obj["centroid"][1])),
                False) >= 0

            if inside:
                intruders += 1
                if obj["in_zone_since"] is None:
                    obj["in_zone_since"] = now

                dwell = now - obj["in_zone_since"]

                if not obj["alerted"]:
                    obj["alerted"] = True
                    sev = "HIGH" if label in PERSON_CLASSES else "MEDIUM"
                    self._record_event("INTRUSION", label, oid, sev,
                                       conf_by_box.get(tuple(obj["box"]), 0.0))
                    active_alerts.append("INTRUSION")

                if dwell >= self.loiter_seconds and not obj["loiter_alerted"]:
                    obj["loiter_alerted"] = True
                    self._record_event("LOITERING", label, oid, "HIGH",
                                       conf_by_box.get(tuple(obj["box"]), 0.0),
                                       extra=f"{int(dwell)}s in zone")
                    active_alerts.append("LOITERING")
            else:
                obj["in_zone_since"] = None

            self._draw_object(frame, oid, obj, inside, now,
                              conf_by_box.get(tuple(obj["box"]), 0.0))

        if active_alerts and now - self.last_alarm > ALERT_COOLDOWN:
            alarm()
            self.last_alarm = now

        self._draw_faces(frame)
        self._draw_plates(frame)
        self._draw_zone(frame, zone, intruders > 0)
        self._draw_hud(frame, persons, vehicles, intruders, luma)

        return frame, {
            "persons": persons,
            "vehicles": vehicles,
            "intruders": intruders,
            "tracked": len(tracked),
            "faces": len(self.faces),
            "plates": len(self.plates),
            "night_mode": self.night_mode,
            "luma": round(luma, 1),
            "alerting": intruders > 0,
            "zone": self.zone_norm,
        }

    # ---------------- events ----------------
    def _record_event(self, kind, label, oid, severity, confidence, extra=""):
        from datetime import datetime
        self.events.insert(0, {
            "time": datetime.now().strftime("%H:%M:%S"),
            "type": kind,
            "object": label,
            "track_id": oid,
            "severity": severity,
            "confidence": round(float(confidence) * 100),
            "detail": extra,
        })
        del self.events[40:]
        print(f"[{kind}] {label} #{oid} · {severity}"
              f"{' · ' + extra if extra else ''}")

    # ---------------- drawing ----------------
    def _draw_zone(self, frame, zone, breached):
        colour = (0, 0, 255) if breached else (0, 190, 255)
        overlay = frame.copy()
        cv2.fillPoly(overlay, [zone], colour)
        cv2.addWeighted(overlay, 0.16, frame, 0.84, 0, frame)
        cv2.polylines(frame, [zone], True, colour, 2)

        x, y = zone[0]
        cv2.putText(frame, "RESTRICTED ZONE", (x + 6, max(y + 22, 24)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, colour, 1)

    def _draw_object(self, frame, oid, obj, inside, now, conf):
        x, y, w, h = obj["box"]
        label = obj["label"]
        colour = (0, 0, 255) if inside else (90, 220, 120)

        cv2.rectangle(frame, (x, y), (x + w, y + h), colour, 2)

        tag = f"{label} #{oid}"
        if conf:
            tag += f" {conf:.0%}"
        if inside and obj["in_zone_since"]:
            tag += f"  {int(now - obj['in_zone_since'])}s"

        (tw, th), _ = cv2.getTextSize(tag, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(frame, (x, y - th - 8), (x + tw + 8, y), colour, -1)
        cv2.putText(frame, tag, (x + 4, y - 5), cv2.FONT_HERSHEY_SIMPLEX,
                    0.5, (255, 255, 255), 1)

        cv2.circle(frame, obj["centroid"], 3, colour, -1)

    def _draw_faces(self, frame):
        for (x, y, w, h) in self.faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 190, 60), 2)
            cv2.putText(frame, "FACE", (x, max(y - 6, 12)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 190, 60), 1)

    def _draw_plates(self, frame):
        for (x, y, w, h) in self.plates:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (80, 220, 255), 2)
            cv2.putText(frame, "PLATE", (x, max(y - 6, 12)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.42, (80, 220, 255), 1)

    def _draw_hud(self, frame, persons, vehicles, intruders, luma):
        h, w = frame.shape[:2]
        cv2.rectangle(frame, (0, 0), (w, 58), (18, 18, 22), -1)

        if intruders:
            banner, colour = f"PERIMETER BREACH  ({intruders})", (0, 0, 255)
        else:
            banner, colour = "SECTOR CLEAR", (0, 220, 120)

        cv2.putText(frame, banner, (12, 24), cv2.FONT_HERSHEY_SIMPLEX,
                    0.7, colour, 2)
        cv2.putText(frame,
                    f"persons {persons}   vehicles {vehicles}   "
                    f"faces {len(self.faces)}   plates {len(self.plates)}   "
                    f"tracked {len(self.tracker.objects)}",
                    (12, 47), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (205, 205, 205), 1)

        if self.night_mode:
            tag = f"NIGHT MODE  (luma {luma:.0f})"
            (tw, _), _ = cv2.getTextSize(tag, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
            cv2.putText(frame, tag, (w - tw - 14, 24),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, (120, 180, 255), 1)


# ------------------------------------------------------------------ standalone
if __name__ == "__main__":
    import sys

    source = sys.argv[1] if len(sys.argv) > 1 else 0
    if isinstance(source, str) and source.isdigit():
        source = int(source)

    det = BorderDetector()
    backend = cv2.CAP_DSHOW if (platform.system() == "Windows"
                                and isinstance(source, int)) else 0
    cap = cv2.VideoCapture(source, backend) if isinstance(source, int) \
        else cv2.VideoCapture(source)

    if not cap.isOpened():
        print(f"Could not open source: {source}")
        sys.exit(1)

    print("\n  q = quit    [ / ] = confidence down/up\n")
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        annotated, summary = det.process_frame(frame)
        cv2.imshow("Border Surveillance — Intelligent Video Analytics",
                   annotated)

        key = cv2.waitKey(1) & 0xFF
        if key == ord("q"):
            break
        elif key == ord("["):
            det.conf_threshold = max(0.05, det.conf_threshold - 0.05)
            print("conf", round(det.conf_threshold, 2))
        elif key == ord("]"):
            det.conf_threshold = min(0.95, det.conf_threshold + 0.05)
            print("conf", round(det.conf_threshold, 2))

    cap.release()
    cv2.destroyAllWindows()