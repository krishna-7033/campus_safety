import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="page-area">
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
