import {
  LayoutDashboard,
  Camera,
  Map,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Live Monitoring",
    path: "/monitoring",
    icon: Camera,
  },
  {
    name: "Campus Map",
    path: "/map",
    icon: Map,
  },
  {
    name: "Incidents",
    path: "/incidents",
    icon: AlertTriangle,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">🐒</div>

        <div>
          <h1>Smart Campus</h1>
          <p>Safety System</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-title">MONITORING</p>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-status">
        <span className="status-dot"></span>

        <div>
          <strong>System Online</strong>
          <p>Monitoring active</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
