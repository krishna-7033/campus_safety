import { useEffect, useState } from "react";

import {
  Users,
  Camera,
  MapPinned,
  Settings,
  ShieldCheck,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  LogOut,
} from "lucide-react";

const adminStats = [
  {
    title: "Registered Users",
    value: "24",
    change: "+12%",
    icon: Users,
  },
  {
    title: "Active Cameras",
    value: "08",
    change: "All online",
    icon: Camera,
  },
  {
    title: "Monitored Zones",
    value: "12",
    change: "3 high risk",
    icon: MapPinned,
  },
  {
    title: "System Status",
    value: "Online",
    change: "99.9% uptime",
    icon: ShieldCheck,
  },
];

const managementCards = [
  {
    title: "Camera Management",
    description:
      "Add, configure and monitor surveillance cameras across campus.",
    icon: Camera,
    action: "Manage Cameras",
  },
  {
    title: "User Management",
    description:
      "Control security personnel, administrators and authorized users.",
    icon: Users,
    action: "Manage Users",
  },
  {
    title: "Safety Zones",
    description: "Configure monitored areas and high-risk zones around campus.",
    icon: MapPinned,
    action: "Manage Zones",
  },
  {
    title: "System Settings",
    description:
      "Configure detection thresholds, alerts and system preferences.",
    icon: Settings,
    action: "Open Settings",
  },
];

function AdminPage() {
  const [user, setUser] = useState(null);
  const [mongoStatus, setMongoStatus] = useState("Checking...");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setMongoStatus("Connected");
      } catch (error) {
        console.error("Invalid stored user:", error);
        localStorage.removeItem("user");
      }
    } else {
      setMongoStatus("Not logged in");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div className="admin-heading">
          <div className="admin-label">
            <ShieldCheck size={15} />
            ADMINISTRATION
          </div>

          <h1>Admin Control Center</h1>

          <p>
            Manage campus safety infrastructure, users and monitoring systems.
          </p>
        </div>

        {user ? (
          <div className="admin-user">
            <div className="admin-avatar">
              {user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="admin-user-info">
              <strong>{user.name || "Administrator"}</strong>
              <span>{user.email || "Administrator"}</span>
            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="admin-auth-actions">
            <button
              className="admin-create-button"
              onClick={() => (window.location.href = "/register")}
            >
              Create Account
            </button>

            <button
              className="admin-login-button"
              onClick={() => (window.location.href = "/login")}
            >
              Login
              <ArrowUpRight size={16} />
            </button>
          </div>
        )}
      </div>

      {user && (
        <div className="admin-connection-bar">
          <div>
            <span className="connection-dot connected"></span>
            <strong>Authentication:</strong>
            <span>Manual Authentication</span>
          </div>

          <div>
            <span
              className={`connection-dot ${
                mongoStatus === "Connected" ? "connected" : "error"
              }`}
            ></span>

            <strong>Database:</strong>

            <span>MongoDB: {mongoStatus}</span>
          </div>

          <div>
            <strong>User ID:</strong>
            <span>{user.id || "N/A"}</span>
          </div>
        </div>
      )}

      <div className="admin-stats">
        {adminStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="admin-stat-card" key={stat.title}>
              <div className="admin-stat-header">
                <div className="admin-stat-icon">
                  <Icon size={20} />
                </div>

                <ArrowUpRight size={17} className="stat-arrow" />
              </div>

              <div className="admin-stat-content">
                <span>{stat.title}</span>
                <h2>{stat.value}</h2>
                <small>{stat.change}</small>
              </div>
            </div>
          );
        })}
      </div>

      <div className="admin-section-heading">
        <div>
          <span>MANAGEMENT</span>
          <h2>System Controls</h2>
        </div>

        <div className="system-online">
          <span></span>
          All systems operational
        </div>
      </div>

      <div className="admin-grid">
        {managementCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="admin-management-card" key={card.title}>
              <div className="management-card-top">
                <div className="management-icon">
                  <Icon size={22} />
                </div>

                <ArrowUpRight size={18} />
              </div>

              <h3>{card.title}</h3>

              <p>{card.description}</p>

              <button onClick={() => console.log(`${card.title} selected`)}>
                {card.action}
              </button>
            </div>
          );
        })}
      </div>

      <div className="admin-bottom-grid">
        <div className="activity-panel">
          <div className="panel-heading">
            <div>
              <span>RECENT ACTIVITY</span>
              <h2>System Activity</h2>
            </div>

            <Activity size={20} />
          </div>

          <div className="activity-item">
            <div className="activity-icon">
              <Camera size={17} />
            </div>

            <div>
              <strong>Camera CAM-08 connected</strong>
              <p>Main Gate · 4 minutes ago</p>
            </div>

            <span className="activity-status">Online</span>
          </div>

          <div className="activity-item">
            <div className="activity-icon">
              <Users size={17} />
            </div>

            <div>
              <strong>New security user added</strong>
              <p>Security Department · 18 minutes ago</p>
            </div>

            <span className="activity-status">Added</span>
          </div>

          <div className="activity-item">
            <div className="activity-icon warning">
              <AlertTriangle size={17} />
            </div>

            <div>
              <strong>High-risk zone updated</strong>
              <p>Hostel Block B · 32 minutes ago</p>
            </div>

            <span className="activity-status warning-text">Updated</span>
          </div>
        </div>

        <div className="health-panel">
          <div className="panel-heading">
            <div>
              <span>SYSTEM HEALTH</span>
              <h2>Infrastructure</h2>
            </div>

            <ShieldCheck size={20} />
          </div>

          <div className="health-item">
            <div>
              <strong>Camera Network</strong>
              <span>24 / 24 devices</span>
            </div>

            <div className="health-bar">
              <span style={{ width: "100%" }}></span>
            </div>
          </div>

          <div className="health-item">
            <div>
              <strong>Monitoring Service</strong>
              <span>Running normally</span>
            </div>

            <div className="health-bar">
              <span style={{ width: "96%" }}></span>
            </div>
          </div>

          <div className="health-item">
            <div>
              <strong>Alert System</strong>
              <span>Operational</span>
            </div>

            <div className="health-bar">
              <span style={{ width: "98%" }}></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
