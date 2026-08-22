import { Users, Camera, MapPinned, Settings, ShieldCheck } from "lucide-react";

const adminStats = [
  {
    title: "Registered Users",
    value: "24",
    icon: Users,
  },
  {
    title: "Active Cameras",
    value: "08",
    icon: Camera,
  },
  {
    title: "Monitored Zones",
    value: "12",
    icon: MapPinned,
  },
  {
    title: "System Status",
    value: "Online",
    icon: ShieldCheck,
  },
];

function AdminPage() {
  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">SYSTEM ADMINISTRATION</p>
          <h2>Admin Panel</h2>
          <p>
            Manage campus monitoring, users, cameras and safety configuration.
          </p>
        </div>

        <div className="admin-status">
          <ShieldCheck size={18} />
          Administrator
        </div>
      </div>

      <div className="admin-stats">
        {adminStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="admin-stat-card" key={stat.title}>
              <div className="admin-stat-icon">
                <Icon size={21} />
              </div>

              <div>
                <p>{stat.title}</p>
                <h3>{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="admin-grid">
        <div className="admin-panel">
          <div className="admin-panel-icon">
            <Camera size={22} />
          </div>

          <div>
            <h3>Camera Management</h3>
            <p>Add, remove and monitor campus surveillance cameras.</p>
          </div>

          <button>Manage Cameras</button>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-icon">
            <Users size={22} />
          </div>

          <div>
            <h3>User Management</h3>
            <p>Manage security personnel and authorized users.</p>
          </div>

          <button>Manage Users</button>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-icon">
            <MapPinned size={22} />
          </div>

          <div>
            <h3>Safety Zones</h3>
            <p>Configure high-risk and monitored areas on campus.</p>
          </div>

          <button>Manage Zones</button>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-icon">
            <Settings size={22} />
          </div>

          <div>
            <h3>System Settings</h3>
            <p>Configure detection thresholds and alert preferences.</p>
          </div>

          <button>Open Settings</button>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
