// src/pages/AnalyticsPage.jsx
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, AlertTriangle, Target, MapPin } from "lucide-react";
import {
  getDailyDetections,
  getSectorBreakdown,
  getThreatLevelBreakdown,
  getTypeBreakdown,
  getHourlyPattern,
  getCameraStats,
  getSummaryStats,
} from "../data/surveillanceDetectionData";

const THREAT_COLORS = {
  Low: "#4ade80",
  Medium: "#facc15",
  High: "#f87171",
};

const TYPE_COLORS = {
  Human: "#f87171",
  Vehicle: "#60a5fa",
  Animal: "#4ade80",
};

function StatCard({ icon: Icon, label, value, subtext }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">
        <Icon size={20} />
      </div>
      <div>
        <p className="stat-card-label">{label}</p>
        <h2 className="stat-card-value">{value}</h2>
        {subtext && <p className="stat-card-subtext">{subtext}</p>}
      </div>
    </div>
  );
}

function AnalyticsPage() {
  // TODO(upgrade): replace these direct calls with data fetched from the
  // real backend once available, e.g. via useEffect + fetch, or a
  // react-query hook. The shape returned by each function should stay
  // the same so the charts below don't need to change.
  const dailyData = getDailyDetections();
  const sectorData = getSectorBreakdown();
  const threatData = getThreatLevelBreakdown();
  const typeData = getTypeBreakdown();
  const hourlyData = getHourlyPattern();
  const cameraStats = getCameraStats();
  const summary = getSummaryStats();

  return (
    <div className="page-container">
      <p className="eyebrow">DATA & INSIGHTS</p>
      <h2>Analytics</h2>
      <p>
        Detection trends, breach frequency by sector, and day versus night
        activity will appear here.
      </p>
    </div>
  );
}

export default AnalyticsPage;