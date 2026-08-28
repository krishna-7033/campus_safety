import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Car,
  CheckCircle,
  CircleStop,
  CreditCard,
  Moon,
  Play,
  Radio,
  ScanFace,
  ShieldCheck,
  Users,
  WifiOff,
} from "lucide-react";

import "./LiveMonitoringPage.css";

const API = "http://localhost:5001";
const POLL_MS = 400;

const SOURCE_PRESETS = [
  { id: "0", label: "Webcam", hint: "Local camera — for demo" },
  { id: "file", label: "Recorded clip", hint: "Path to an .mp4 on disk" },
  { id: "rtsp", label: "CCTV (RTSP)", hint: "rtsp://user:pass@ip:554/stream" },
];

function LiveMonitoringPage() {
  const [status, setStatus] = useState(null);
  const [offline, setOffline] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [sourceKind, setSourceKind] = useState("0");
  const [sourceValue, setSourceValue] = useState("");
  const [confidence, setConfidence] = useState(0.35);
  const [loiter, setLoiter] = useState(5);

  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState([]);

  const streamRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`${API}/status`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (cancelled) return;
        setStatus(data);
        setOffline(false);
      } catch {
        if (!cancelled) setOffline(true);
      }
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const post = useCallback(async (path, body) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!data.ok) setError(data.error || "request failed");
      return data;
    } catch {
      setError("Cannot reach the analytics server. Is surveillance_server.py running?");
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  const handleStart = async () => {
    const source = sourceKind === "0" ? 0 : sourceValue.trim();
    if (sourceKind !== "0" && !source) {
      setError("Enter a file path or RTSP URL first.");
      return;
    }
    const res = await post("/start", { source });
    if (res?.ok && streamRef.current) {
      streamRef.current.src = `${API}/video_feed?t=${Date.now()}`;
    }
  };

  // ---- click-to-define restricted zone ----
  const handleFeedClick = (e) => {
    if (!drawing) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setPoints((p) => [...p, [+x.toFixed(3), +y.toFixed(3)]]);
  };

  const applyZone = async () => {
    if (points.length < 3) {
      setError("A zone needs at least 3 points.");
      return;
    }
    const res = await post("/zone", { points });
    if (res?.ok) {
      setDrawing(false);
      setPoints([]);
    }
  };

  const running = status?.running;
  const alerting = status?.alerting;
  const events = status?.events ?? [];
  const zone = status?.zone ?? [];

  const stats = [
    { label: "Persons", value: status?.persons ?? 0, icon: Users },
    { label: "Vehicles", value: status?.vehicles ?? 0, icon: Car },
    { label: "Faces", value: status?.faces ?? 0, icon: ScanFace },
    { label: "Plates", value: status?.plates ?? 0, icon: CreditCard },
    { label: "In Zone", value: status?.intruders ?? 0, icon: AlertTriangle,
      danger: (status?.intruders ?? 0) > 0 },
    { label: "Tracked", value: status?.tracked ?? 0, icon: Radio },
  ];

  // Maps each capability the problem statement asks for to what this
  // build actually does. Being explicit about the ANPR boundary is
  // deliberate — the plate is localised, the characters are not read.
  const capabilities = [
    { name: "Human detection & tracking", state: "done" },
    { name: "Vehicle detection & classification", state: "done" },
    { name: "Face detection", state: "done" },
    { name: "ANPR", state: "partial", note: "plate localised; OCR not implemented" },
    { name: "Virtual fence intrusion", state: "done" },
    { name: "Suspicious activity", state: "partial", note: "loitering + rapid movement" },
    { name: "Night-time movement", state: "done", note: "auto low-light enhancement" },
    { name: "Real-time alerts & event log", state: "done" },
  ];

  return (
    <div className="page-container">
      <p className="eyebrow">AI SURVEILLANCE</p>
      <h2>Border Surveillance — Live Analytics</h2>

      {offline && (
        <div className="detector-offline">
          <WifiOff size={18} />
          <div>
            <strong>Analytics server offline.</strong>
            <span>
              Run <code>py surveillance_server.py</code>, then this page connects
              automatically.
            </span>
          </div>
        </div>
      )}

      {error && <div className="detector-error">{error}</div>}

      {/* ---------------- source ---------------- */}
      <div className="panel source-panel">
        <div className="panel-header">
          <div>
            <p className="panel-label">VIDEO SOURCE</p>
            <h3>Camera Input</h3>
          </div>
          {running && <span className="fps-readout">{status?.fps ?? 0} fps</span>}
        </div>

        <div className="source-picker">
          {SOURCE_PRESETS.map((s) => (
            <button
              key={s.id}
              className={sourceKind === s.id ? "source-chip active" : "source-chip"}
              onClick={() => setSourceKind(s.id)}
              disabled={running}
            >
              <strong>{s.label}</strong>
              <span>{s.hint}</span>
            </button>
          ))}
        </div>

        {sourceKind !== "0" && (
          <input
            className="source-input"
            placeholder={
              sourceKind === "rtsp"
                ? "rtsp://admin:password@192.168.1.64:554/Streaming/Channels/101"
                : "C:\\footage\\border_clip.mp4"
            }
            value={sourceValue}
            onChange={(e) => setSourceValue(e.target.value)}
            disabled={running}
          />
        )}

        <div className="camera-controls">
          <button className="btn primary" onClick={handleStart}
                  disabled={busy || offline || running}>
            <Play size={16} /> Start Feed
          </button>
          <button className="btn" onClick={() => post("/stop")}
                  disabled={busy || offline || !running}>
            <CircleStop size={16} /> Stop
          </button>
        </div>
      </div>

      {/* ---------------- stats ---------------- */}
      <section className="stats-grid surveillance-stats">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div className={s.danger ? "stat-card danger" : "stat-card"}
                 key={s.label}>
              <div className="stat-icon"><Icon size={22} /></div>
              <div>
                <p>{s.label}</p>
                <h3>{s.value}</h3>
              </div>
            </div>
          );
        })}
      </section>

      <div className="monitor-grid">
        {/* ---------------- feed ---------------- */}
        <div className="panel monitoring-panel">
          <div className="panel-header">
            <div>
              <p className="panel-label">LIVE ANALYTICS</p>
              <h3>Sector Feed</h3>
            </div>
            {running && (
              <div className={alerting ? "live-badge alert" : "live-badge"}>
                <span></span>
                {alerting ? "BREACH" : "CLEAR"}
              </div>
            )}
          </div>

          <div
            className={alerting ? "camera-feed alerting" : "camera-feed"}
            onClick={handleFeedClick}
            style={{ cursor: drawing ? "crosshair" : "default" }}
          >
            {offline ? (
              <div className="camera-overlay">
                <Radio size={32} />
                <p>No signal</p>
                <span>Waiting for analytics server...</span>
              </div>
            ) : (
              <>
                <img
                  ref={streamRef}
                  className="camera-stream"
                  src={`${API}/video_feed`}
                  alt="Live surveillance feed with detection overlays"
                />
                {drawing && (
                  <svg className="zone-draw" viewBox="0 0 100 100"
                       preserveAspectRatio="none">
                    {points.length > 1 && (
                      <polygon
                        points={points.map(([x, y]) => `${x * 100},${y * 100}`).join(" ")}
                        fill="rgba(255,176,32,0.18)"
                        stroke="#ffb020"
                        strokeWidth="0.4"
                      />
                    )}
                    {points.map(([x, y], i) => (
                      <circle key={i} cx={x * 100} cy={y * 100} r="0.9"
                              fill="#ffb020" />
                    ))}
                  </svg>
                )}
              </>
            )}
          </div>

          <div className="camera-controls">
            {!drawing ? (
              <button className="btn" onClick={() => { setDrawing(true); setPoints([]); }}
                      disabled={offline}>
                Define Restricted Zone
              </button>
            ) : (
              <>
                <button className="btn primary" onClick={applyZone}
                        disabled={points.length < 3}>
                  Apply Zone ({points.length} pts)
                </button>
                <button className="btn" onClick={() => setPoints([])}>Clear</button>
                <button className="btn" onClick={() => { setDrawing(false); setPoints([]); }}>
                  Cancel
                </button>
              </>
            )}
          </div>

          {drawing && (
            <p className="hint">
              Click the feed to place boundary points. Three or more defines the
              restricted area.
            </p>
          )}
        </div>

        {/* ---------------- controls ---------------- */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-label">DETECTION PARAMETERS</p>
              <h3>Tuning</h3>
            </div>
            {alerting ? <AlertTriangle size={22} color="#ff6b6b" />
                      : <ShieldCheck size={22} />}
          </div>

          <div className="threshold-control">
            <label>
              Detection confidence <strong>{confidence.toFixed(2)}</strong>
            </label>
            <input type="range" min="0.05" max="0.95" step="0.05"
                   value={confidence} disabled={offline}
                   onChange={(e) => {
                     const v = parseFloat(e.target.value);
                     setConfidence(v);
                     post("/config", { confidence: v });
                   }} />
            <p className="hint">
              Lower catches distant figures but adds false positives.
            </p>
          </div>

          <div className="threshold-control">
            <label>
              Loitering threshold <strong>{loiter}s</strong>
            </label>
            <input type="range" min="2" max="30" step="1"
                   value={loiter} disabled={offline}
                   onChange={(e) => {
                     const v = parseInt(e.target.value, 10);
                     setLoiter(v);
                     post("/config", { loiter: v });
                   }} />
            <p className="hint">
              Dwell time inside the zone before a loitering alert is raised.
            </p>
          </div>

          <div className="threshold-control">
            <label>
              <Moon size={14} style={{ verticalAlign: "-2px" }} /> Night mode
              {status?.night_mode && <strong className="night-on"> ACTIVE</strong>}
            </label>
            <div className="night-buttons">
              {["auto", "on", "off"].map((m) => (
                <button
                  key={m}
                  className={
                    (status?.night_setting ?? "auto") === m
                      ? "btn small active"
                      : "btn small"
                  }
                  disabled={offline}
                  onClick={() => post("/config", { night: m })}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="hint">
              Auto engages low-light enhancement when scene luminance drops
              below 70. Current: <strong>{status?.luma ?? "—"}</strong>
            </p>
          </div>

          <div className="zone-readout">
            <p className="panel-label">ACTIVE ZONE</p>
            <p className="hint">
              {zone.length} boundary points
              {status?.source !== undefined && status?.source !== null && (
                <> · source <code>{String(status.source)}</code></>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- capability coverage ---------------- */}
      <div className="panel capability-panel">
        <div className="panel-header">
          <div>
            <p className="panel-label">PS 26187 · CAPABILITY COVERAGE</p>
            <h3>Requirements Status</h3>
          </div>
        </div>

        <ul className="capability-list">
          {capabilities.map((c) => (
            <li key={c.name}>
              {c.state === "done" ? (
                <CheckCircle size={16} className="cap-done" />
              ) : (
                <AlertTriangle size={16} className="cap-partial" />
              )}
              <span className="cap-name">{c.name}</span>
              {c.note && <span className="cap-note">{c.note}</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* ---------------- events ---------------- */}
      <div className="panel detections-panel">
        <div className="panel-header">
          <div>
            <p className="panel-label">EVENT LOG</p>
            <h3>Security Events</h3>
          </div>
        </div>

        {events.length === 0 ? (
          <p className="empty-log">No events recorded this session.</p>
        ) : (
          <ul className="detection-list">
            {events.map((e, i) => (
              <li key={`${e.time}-${i}`}>
                <span className="det-time">{e.time}</span>
                <span className={`event-type ${e.type.toLowerCase()}`}>
                  {e.type}
                </span>
                <span className="det-label">
                  {e.object} #{e.track_id}
                  {e.detail && <em> · {e.detail}</em>}
                </span>
                <span className={`severity ${e.severity.toLowerCase()}`}>
                  {e.severity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default LiveMonitoringPage;
