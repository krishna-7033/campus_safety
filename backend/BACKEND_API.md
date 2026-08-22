# Camera Feed & Analytics API

The detection backend runs as a local Flask server on **port 5000**. The
frontend never touches the camera or the model — it consumes a video stream
and a JSON status endpoint. CORS is open, so the Vite dev server on 5173 can
call it directly.

Start it with:

```
cd backend
pip install -r requirements.txt
py surveillance_server.py
```

## The video feed

One line. It is a standard MJPEG stream, so a plain `<img>` renders it — no
player library, no WebRTC, no canvas.

```jsx
<img src="http://localhost:5000/video_feed" alt="Live feed" />
```

Frames arrive already annotated: detection boxes, track IDs, the restricted
zone, face and plate boxes, and a status banner are drawn server-side.

To force a reconnect after restarting the source, cache-bust the URL:

```js
img.src = `http://localhost:5000/video_feed?t=${Date.now()}`;
```

## Endpoints

| Method | Path | Body | Purpose |
|---|---|---|---|
| GET | `/health` | — | Liveness check → `{ok: true}` |
| GET | `/video_feed` | — | MJPEG stream for `<img>` |
| GET | `/status` | — | Full state + event log (poll this) |
| POST | `/start` | `{source}` | Open a source and begin analytics |
| POST | `/stop` | — | Release the source |
| POST | `/zone` | `{points}` | Set the restricted-zone polygon |
| POST | `/config` | see below | Tune detection live |

### POST `/start`

`source` accepts three forms — all use the same code path:

```json
{ "source": 0 }                                   // webcam index
{ "source": "C:\\footage\\clip.mp4" }             // recorded file (loops)
{ "source": "rtsp://user:pass@192.168.1.64:554/Streaming/Channels/101" }
```

Returns `{ok: true, source: "..."}` or `{ok: false, error: "..."}` with 500.

### GET `/status`

Poll every ~400 ms.

```json
{
  "running": true,
  "source": 0,
  "alerting": true,
  "persons": 2,
  "vehicles": 1,
  "faces": 1,
  "plates": 0,
  "intruders": 1,
  "tracked": 3,
  "night_mode": false,
  "luma": 118.4,
  "night_setting": "auto",
  "fps": 16.8,
  "confidence": 0.35,
  "loiter": 5.0,
  "zone": [[0.55, 0.05], [0.97, 0.05], [0.97, 0.95], [0.55, 0.95]],
  "events": [
    {
      "time": "22:14:07",
      "type": "INTRUSION",
      "object": "person",
      "track_id": 3,
      "severity": "HIGH",
      "confidence": 91,
      "detail": ""
    }
  ]
}
```

`events` is newest-first, capped at 40. `type` is one of `INTRUSION`,
`LOITERING`, `SUSPICIOUS`. `severity` is `HIGH` or `MEDIUM`.

Events are recorded on the **rising edge** — one row per object per event, not
one per frame. So you can render the list directly without deduplicating.

### POST `/zone`

Points are normalised `0..1` relative to frame width and height, so they stay
correct regardless of the displayed size. Minimum 3 points.

```json
{ "points": [[0.2, 0.3], [0.8, 0.3], [0.8, 0.9], [0.2, 0.9]] }
```

To capture clicks on the feed:

```js
const r = e.currentTarget.getBoundingClientRect();
const x = (e.clientX - r.left) / r.width;
const y = (e.clientY - r.top) / r.height;
```

### POST `/config`

Any subset of these:

```json
{ "confidence": 0.35, "loiter": 5, "night": "auto" }
```

- `confidence` — 0.05–0.95 detection threshold
- `loiter` — 1–60 seconds dwell before a loitering alert
- `night` — `"auto"` | `"on"` | `"off"`

## Notes for the frontend

- The server holds the camera. Only one process can, so close any standalone
  Python window before starting the server.
- If `/status` fails, treat it as "backend offline" and show a message rather
  than erroring — the page should load fine without the backend running.
- `/video_feed` returns a placeholder "NO SIGNAL" frame when no source is
  active, so the `<img>` never breaks.
- MJPEG holds an open connection. That is expected and is why the server runs
  with `threaded=True`.

## What is NOT implemented

Worth knowing before you build UI around it: **ANPR does not read plate
characters.** The plate region is located and boxed only. Do not add a field
for plate text — there is nothing to put in it yet.
