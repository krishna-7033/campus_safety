import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import LiveMonitoringPage from "./pages/LiveMonitoringPage";
import CampusMapPage from "./pages/CampusMapPage";
import IncidentsPage from "./pages/IncidentsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/monitoring" element={<LiveMonitoringPage />} />
        <Route path="/map" element={<CampusMapPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}

export default App;
