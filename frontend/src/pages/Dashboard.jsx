import {
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle,
  MapPin,
  ShieldCheck,
  Activity,
} from "lucide-react";

const stats = [
  {
    title: "Total Detections",
    value: "12",
    icon: Activity,
  },
  {
    title: "High Risk Events",
    value: "3",
    icon: AlertTriangle,
  },
  {
    title: "Active Alerts",
    value: "1",
    icon: Bell,
  },
];

function Dashboard() {
  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">🐒</div>
          <div>
            <h1>Smart Campus Safety</h1>
            <p>AI-Powered Wildlife Safety System</p>
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          System Active
        </div>
      </header>

      <main className="main-content">
        <section className="welcome">
          <div>
            <p className="eyebrow">CAMPUS SECURITY CONTROL CENTER</p>
            <h2>Protecting students with intelligent monitoring.</h2>
            <p>
              Detect wildlife activity, assess risk, and automatically initiate
              preventive safety responses.
            </p>
          </div>

          <div className="security-badge">
            <ShieldCheck size={28} />
            <span>Campus Protected</span>
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
                <h3>Camera Feed</h3>
              </div>

              <div className="live-badge">
                <span></span>
                LIVE
              </div>
            </div>

            <div className="camera-feed">
              <div className="camera-overlay">
                <Camera size={32} />
                <p>Camera feed will appear here</p>
                <span>Waiting for AI detection...</span>
              </div>
            </div>
          </div>

          <div className="panel map-panel">
            <div className="panel-header">
              <div>
                <p className="panel-label">CAMPUS MONITORING</p>
                <h3>Risk Map</h3>
              </div>

              <MapPin size={22} />
            </div>

            <div className="map-placeholder">
              <div className="map-grid"></div>

              <div className="map-marker marker-one">📍</div>
              <div className="map-marker marker-two">📍</div>

              <div className="map-label">
                <span className="risk-dot high"></span>
                High Risk Zone
              </div>
            </div>
          </div>
        </section>

        <section className="alert-card">
          <div className="alert-icon">
            <AlertTriangle size={24} />
          </div>

          <div className="alert-content">
            <div className="alert-title">
              <span>HIGH RISK ALERT</span>
              <span className="alert-time">2 min ago</span>
            </div>

            <h3>Monkey detected near Hostel Block A</h3>

            <p>
              AI confidence: <strong>94%</strong> · Risk level:{" "}
              <strong>HIGH</strong>
            </p>
          </div>

          <div className="response-status">
            <CheckCircle size={18} />
            Response Activated
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
