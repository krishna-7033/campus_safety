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
  getZoneBreakdown,
  getSeverityBreakdown,
  getHourlyPattern,
  getCameraStats,
  getSummaryStats,
} from "../data/monkeyDetectionData";

const SEVERITY_COLORS = {
  Low: "#4ade80",
  Medium: "#facc15",
  High: "#f87171",
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
  const zoneData = getZoneBreakdown();
  const severityData = getSeverityBreakdown();
  const hourlyData = getHourlyPattern();
  const cameraStats = getCameraStats();
  const summary = getSummaryStats();

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Monkey detection trends and patterns across campus</p>
      </div>

      {/* Summary stat cards */}
      <div className="stats-grid">
        <StatCard
          icon={Target}
          label="Total Sightings"
          value={summary.totalSightings}
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
          label="High Severity"
          value={summary.highSeverityEvents}
          subtext="Events flagged high"
        />
        <StatCard
          icon={MapPin}
          label="Busiest Zone"
          value={summary.busiestZone}
          subtext="Most sightings"
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
                name="Sightings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Severity breakdown */}
        <div className="chart-card">
          <h3>Severity Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={severityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {severityData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={SEVERITY_COLORS[entry.name] || "#8884d8"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Zone breakdown */}
        <div className="chart-card">
          <h3>Sightings by Zone</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={zoneData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" />
              <XAxis type="number" stroke="#888" fontSize={12} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="zone"
                stroke="#888"
                fontSize={12}
                width={110}
              />
              <Tooltip
                contentStyle={{ background: "#1a1a2e", border: "1px solid #333" }}
              />
              <Bar dataKey="count" fill="#f472b6" radius={[0, 4, 4, 0]} name="Sightings" />
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
              <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} name="Sightings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Camera reliability table */}
      <div className="table-card">
        <h3>Camera Activity</h3>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Camera</th>
              <th>Zone</th>
              <th>Detections</th>
              <th>Avg. Confidence</th>
            </tr>
          </thead>
          <tbody>
            {cameraStats.map((c) => (
              <tr key={c.camera}>
                <td>{c.camera}</td>
                <td>{c.zone}</td>
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
