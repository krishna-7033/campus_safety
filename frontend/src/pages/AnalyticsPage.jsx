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

import {
  TrendingUp,
  AlertTriangle,
  Target,
  MapPin,
} from "lucide-react";

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

        <h2 className="stat-card-value">
          {value}
        </h2>

        {subtext && (
          <p className="stat-card-subtext">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const dailyData = getDailyDetections();
  const sectorData = getSectorBreakdown();
  const threatData = getThreatLevelBreakdown();
  const typeData = getTypeBreakdown();
  const hourlyData = getHourlyPattern();
  const cameraStats = getCameraStats();
  const summary = getSummaryStats();

  return (
    <div className="page-container">

      <p className="eyebrow">
        DATA & INSIGHTS
      </p>

      <h2>
        Analytics
      </h2>

      <p className="analytics-description">
        Detection trends, breach frequency by sector,
        and day versus night activity.
      </p>


      {/* SUMMARY CARDS */}

      <div className="stats-grid">

        <StatCard
          icon={TrendingUp}
          label="Total Detections"
          value={summary.totalDetections}
          subtext={`${summary.totalEvents} detection events`}
        />

        <StatCard
          icon={AlertTriangle}
          label="High Threat Events"
          value={summary.highThreatEvents}
          subtext="Requires attention"
        />

        <StatCard
          icon={Target}
          label="Avg. Confidence"
          value={`${summary.avgConfidence}%`}
          subtext="AI detection confidence"
        />

        <StatCard
          icon={MapPin}
          label="Most Active Sector"
          value={summary.mostActiveSector}
          subtext="Highest detection count"
        />

      </div>


      {/* DAILY DETECTIONS */}

      <div className="analytics-card">

        <div className="analytics-card-header">

          <h3>
            Daily Detection Trend
          </h3>

          <p>
            Detection activity over time
          </p>

        </div>

        <div className="chart-container">

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <LineChart data={dailyData}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="date"
              />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="count"
                name="Detections"
                stroke="#60a5fa"
                strokeWidth={3}
                dot={{ r: 4 }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* SECTOR + THREAT */}

      <div className="analytics-grid">


        {/* SECTOR */}

        <div className="analytics-card">

          <div className="analytics-card-header">

            <h3>
              Sector Breakdown
            </h3>

            <p>
              Detections by campus sector
            </p>

          </div>

          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <BarChart data={sectorData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="sector"
                  angle={-25}
                  textAnchor="end"
                  height={90}
                  interval={0}
                />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="count"
                  name="Detections"
                  fill="#60a5fa"
                  radius={[5, 5, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* THREAT */}

        <div className="analytics-card">

          <div className="analytics-card-header">

            <h3>
              Threat Level Distribution
            </h3>

            <p>
              Low, medium and high threat detections
            </p>

          </div>

          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <PieChart>

                <Pie
                  data={threatData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >

                  {threatData.map(
                    (entry, index) => (
                      <Cell
                        key={`threat-${index}`}
                        fill={
                          THREAT_COLORS[
                            entry.name
                          ]
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>


      {/* TYPE + HOURLY */}

      <div className="analytics-grid">


        {/* DETECTION TYPES */}

        <div className="analytics-card">

          <div className="analytics-card-header">

            <h3>
              Detection Types
            </h3>

            <p>
              Humans, vehicles and animals
            </p>

          </div>

          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <PieChart>

                <Pie
                  data={typeData}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >

                  {typeData.map(
                    (entry, index) => (
                      <Cell
                        key={`type-${index}`}
                        fill={
                          TYPE_COLORS[
                            entry.type
                          ]
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* HOURLY ACTIVITY */}

        <div className="analytics-card">

          <div className="analytics-card-header">

            <h3>
              Activity by Time of Day
            </h3>

            <p>
              Detection activity throughout the day
            </p>

          </div>

          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <BarChart data={hourlyData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="label"
                  angle={-20}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="count"
                  name="Detections"
                  fill="#4ade80"
                  radius={[5, 5, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>


      {/* CAMERA STATISTICS */}

      <div className="analytics-card">

        <div className="analytics-card-header">

          <h3>
            Camera Statistics
          </h3>

          <p>
            Detection activity and average AI
            confidence by camera
          </p>

        </div>


        <div className="camera-table">

          <div className="camera-table-header">

            <span>
              Camera
            </span>

            <span>
              Sector
            </span>

            <span>
              Events
            </span>

            <span>
              Avg. Confidence
            </span>

          </div>


          {cameraStats.map(
            (camera) => (

              <div
                className="camera-table-row"
                key={camera.camera}
              >

                <strong>
                  {camera.camera}
                </strong>

                <span>
                  {camera.sector}
                </span>

                <span>
                  {camera.detections}
                </span>

                <span>
                  {camera.avgConfidence}%
                </span>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}

export default AnalyticsPage;
