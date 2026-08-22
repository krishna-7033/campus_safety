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
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Detection trends and patterns across monitored border sectors</p>
      </div>

      {/* Summary stat cards */}
      <div className="stats-grid">
        <StatCard
          icon={Target}
          label="Total Detections"
          value={summary.totalDetections}
          subtext="Last 7 days"
        />
        <StatCard
          icon={TrendingUp}
          label="Detection Events"
          value={summary.totalEvents}
          subtext={`${summary.avgConfidence}% avg. confidence`}
        />
        <StatCard
          icon={AlertTriangle}
          label="High Threat"
          value={summary.highThreatEvents}
          subtext="Events flagged high"
        />
        <StatCard
          icon={MapPin}
          label="Most Active Sector"
          value={summary.mostActiveSector}
          subtext="Highest detection count"
        />
      </div>

      <div className="charts-grid">
        {/* Trend over time */}
        <div className="chart-card chart-card-wide">
          <h3>Detection Trend (Daily)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a2e", border: "1px solid #333" }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Detections"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Threat level breakdown */}
        <div className="chart-card">
          <h3>Threat Level Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={threatData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {threatData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={THREAT_COLORS[entry.name] || "#8884d8"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detection type breakdown */}
        <div className="chart-card">
          <h3>Detections by Type</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={typeData}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {typeData.map((entry) => (
                  <Cell
                    key={entry.type}
                    fill={TYPE_COLORS[entry.type] || "#8884d8"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sector breakdown */}
        <div className="chart-card">
          <h3>Detections by Sector</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sectorData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" />
              <XAxis type="number" stroke="#888" fontSize={12} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="sector"
                stroke="#888"
                fontSize={11}
                width={150}
              />
              <Tooltip
                contentStyle={{ background: "#1a1a2e", border: "1px solid #333" }}
              />
              <Bar dataKey="count" fill="#f472b6" radius={[0, 4, 4, 0]} name="Detections" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly pattern */}
        <div className="chart-card chart-card-wide">
          <h3>Activity by Time of Day</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" />
              <XAxis dataKey="label" stroke="#888" fontSize={11} />
              <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a2e", border: "1px solid #333" }}
              />
              <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} name="Detections" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Camera activity table */}
      <div className="table-card">
        <h3>Camera Activity</h3>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Camera</th>
              <th>Sector</th>
              <th>Detections</th>
              <th>Avg. Confidence</th>
            </tr>
          </thead>
          <tbody>
            {cameraStats.map((c) => (
              <tr key={c.camera}>
                <td>{c.camera}</td>
                <td>{c.sector}</td>
                <td>{c.detections}</td>
                <td>{c.avgConfidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AnalyticsPage;