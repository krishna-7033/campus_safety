import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle,
  Cpu,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

const API = "http://localhost:5001";

function Dashboard() {
  const [status, setStatus] = useState(null);
  const [offline, setOffline] = useState(true);

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
    const id = setInterval(tick, 800);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const events = status?.events ?? [];
  const latest = events[0];

  const stats = [
    { title: "Events Logged", value: String(events.length), icon: Activity },
    {
      title: "Perimeter Breaches",
      value: String(events.filter((e) => e.type === "INTRUSION").length),
      icon: AlertTriangle,
    },
    { title: "Active Alerts", value: String(status?.intruders ?? 0), icon: Bell },
    { title: "Objects Tracked", value: String(status?.tracked ?? 0), icon: Users },
  ];

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">🛡️</div>
          <div>
            <h1>IBVAP — Intelligent Border Video Analytics</h1>
            <p>Sashastra Seema Bal · Ministry of Home Affairs</p>
          </div>
        </div>

        <div className="system-status">
          <span
            className="status-dot"
            style={offline ? { background: "#ff5c5c" } : undefined}
          ></span>
          {offline ? "Analytics Offline" : "System Active"}
        </div>
      </header>

      <main className="main-content">
        <section className="welcome">
          <div>
            <p className="eyebrow">BORDER SURVEILLANCE COMMAND CENTRE</p>
            <h2>Turning existing CCTV into an intelligent watch.</h2>
            <p>
              Real-time human and vehicle detection, virtual fence intrusion,
              face and number-plate localisation, and night-time movement
              analytics — running on standard IP cameras, on-premise, with no
              dedicated surveillance hardware.
            </p>
          </div>

          <div className="security-badge">
            <ShieldCheck size={28} />
            <span>Sector Monitored</span>
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div className="stat-card" key={stat.title}>
                <div className="stat-icon">
                  <Icon size={22} />
                </div>
                <div>
                  <p>{stat.title}</p>
                  <h3>{stat.value}</h3>
                </div>
              </div>
            );
          })}
        </section>

        <section className="monitor-grid">
          <div className="panel monitoring-panel">
            <div className="panel-header">
              <div>
                <p className="panel-label">LIVE MONITORING</p>
                <h3>Sector Feed</h3>
              </div>

              {status?.running && (
                <div
                  className={status?.alerting ? "live-badge alert" : "live-badge"}
                >
                  <span></span>
                  {status?.alerting ? "BREACH" : "LIVE"}
                </div>
              )}
            </div>

            <div className="camera-feed">
              {status?.running ? (
                <img
                  className="camera-stream"
                  src={`${API}/video_feed`}
                  alt="Live sector feed"
                />
              ) : (
                <div className="camera-overlay">
                  <Camera size={32} />
                  <p>No active feed</p>
                  <span>
                    {offline
                      ? "Start the analytics server"
                      : "Open Live Monitoring to select a source"}
                  </span>
                </div>
              )}
            </div>

            <div className="camera-controls">
              <Link className="btn primary" to="/monitoring">
                Open Live Monitoring
              </Link>
            </div>
          </div>

          <div className="panel map-panel">
            <div className="panel-header">
              <div>
                <p className="panel-label">DEPLOYMENT</p>
                <h3>Platform Profile</h3>
              </div>

              <Cpu size={22} />
            </div>

            <ul className="capability-list" style={{ marginTop: 4 }}>
              <li>
                <CheckCircle size={16} className="cap-done" />
                <span className="cap-name">Inference</span>
                <span className="cap-note">CPU only · no GPU</span>
              </li>
              <li>
                <CheckCircle size={16} className="cap-done" />
                <span className="cap-name">Model footprint</span>
                <span className="cap-note">24 MB total</span>
              </li>
              <li>
                <CheckCircle size={16} className="cap-done" />
                <span className="cap-name">Camera input</span>
                <span className="cap-note">Standard RTSP</span>
              </li>
              <li>
                <CheckCircle size={16} className="cap-done" />
                <span className="cap-name">Data residency</span>
                <span className="cap-note">On-premise · no cloud</span>
              </li>
              <li>
                <CheckCircle size={16} className="cap-done" />
                <span className="cap-name">Throughput</span>
                <span className="cap-note">
                  {status?.fps ? `${status.fps} fps live` : "~17 fps @ 416px"}
                </span>
              </li>
              <li>
                <CheckCircle size={16} className="cap-done" />
                <span className="cap-name">Training required</span>
                <span className="cap-note">None · pretrained COCO</span>
              </li>
            </ul>
          </div>
        </section>

        {latest ? (
          <section className="alert-card">
            <div className="alert-icon">
              <AlertTriangle size={24} />
            </div>

            <div className="alert-content">
              <div className="alert-title">
                <span>
                  {latest.severity} SEVERITY · {latest.type}
                </span>
                <span className="alert-time">{latest.time}</span>
              </div>

              <h3>
                {latest.object} #{latest.track_id} detected in restricted zone
              </h3>

              <p>
                {latest.detail ? <>{latest.detail} · </> : null}
                Source: <strong>{String(status?.source ?? "—")}</strong>
                {status?.night_mode && (
                  <>
                    {" "}
                    · <strong>night mode active</strong>
                  </>
                )}
              </p>
            </div>

            <div className="response-status">
              <CheckCircle size={18} />
              Alert Raised
            </div>
          </section>
        ) : (
          <section className="alert-card" style={{ opacity: 0.75 }}>
            <div className="alert-icon">
              <MapPin size={24} />
            </div>
            <div className="alert-content">
              <div className="alert-title">
                <span>SECTOR STATUS</span>
              </div>
              <h3>No security events recorded this session</h3>
              <p>
                {offline
                  ? "Analytics server is not running."
                  : "Monitoring active. Events will appear here as they occur."}
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
