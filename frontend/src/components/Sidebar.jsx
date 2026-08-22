import {
  LayoutDashboard,
  Camera,
  Map,
  AlertTriangle,
  BarChart3,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  { name: "Command Centre", path: "/", icon: LayoutDashboard },
  { name: "Live Monitoring", path: "/monitoring", icon: Camera },
  { name: "Sector Map", path: "/map", icon: Map },
  { name: "Incidents", path: "/incidents", icon: AlertTriangle },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Administration", path: "/admin", icon: Settings },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">🛡️</div>

        <div>
          <h1>IBVAP</h1>
          <p>Border Video Analytics</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-title">SURVEILLANCE</p>

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
          <p>SSB · BOP Sector</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
