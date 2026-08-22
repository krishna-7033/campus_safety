import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Search,
  ShieldAlert,
  MapPin,
  Camera,
  ChevronRight,
  Filter,
  UserRound,
  Car,
  Eye,
  Radio,
  ScanLine,
  Siren,
} from "lucide-react";
import { useState } from "react";

const incidents = [
  {
    id: "BSA-1024",
    title: "Perimeter Intrusion Detected",
    description:
      "AI detected a person crossing the virtual boundary line in a restricted surveillance zone.",
    location: "Border Sector A - Gate 04",
    camera: "CCTV-014",
    time: "2 min ago",
    severity: "Critical",
    status: "Active",
    type: "Person Intrusion",
    confidence: "97%",
    icon: UserRound,
  },
  {
    id: "BSA-1023",
    title: "Suspicious Loitering",
    description:
      "Person detected remaining within a restricted zone beyond the configured dwell-time threshold.",
    location: "Border Sector B - Patrol Zone",
    camera: "CCTV-027",
    time: "18 min ago",
    severity: "High",
    status: "Investigating",
    type: "Loitering",
    confidence: "91%",
    icon: Eye,
  },
  {
    id: "BSA-1022",
    title: "Unauthorized Vehicle Movement",
    description:
      "AI detected a vehicle entering a monitored restricted corridor outside the permitted movement window.",
    location: "Border Sector C - Service Road",
    camera: "CCTV-031",
    time: "42 min ago",
    severity: "High",
    status: "Investigating",
    type: "Vehicle Detection",
    confidence: "94%",
    icon: Car,
  },
  {
    id: "BSA-1021",
    title: "Virtual Line Crossing",
    description:
      "Movement detected across a predefined virtual tripwire in a controlled border zone.",
    location: "Border Sector D - Fence Line",
    camera: "CCTV-042",
    time: "1 hr ago",
    severity: "Medium",
    status: "Resolved",
    type: "Line Crossing",
    confidence: "89%",
    icon: ScanLine,
  },
  {
    id: "BSA-1020",
    title: "Multiple Person Detection",
    description:
      "AI analytics detected multiple individuals approaching a sensitive surveillance area.",
    location: "Border Sector A - Observation Zone",
    camera: "CCTV-008",
    time: "2 hrs ago",
    severity: "Critical",
    status: "Resolved",
    type: "Crowd / Group Detection",
    confidence: "96%",
    icon: UserRound,
  },
];

function Incidents() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.title.toLowerCase().includes(search.toLowerCase()) ||
      incident.location.toLowerCase().includes(search.toLowerCase()) ||
      incident.id.toLowerCase().includes(search.toLowerCase()) ||
      incident.type.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || incident.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="incidents-page">
      {/* Header */}
      <div className="incidents-header">
        <div>
          <p className="eyebrow">AI VIDEO ANALYTICS • BORDER SURVEILLANCE</p>

          <h2>Security Incidents</h2>

          <p className="incidents-subtitle">
            AI-powered detection, prioritization and investigation of
            security events across existing CCTV infrastructure.
          </p>
        </div>

        <div className="incident-security">
          <span className="status-dot"></span>
          AI Monitoring Active
        </div>
      </div>

      {/* Statistics */}
      <div className="incident-stats">
        <div className="incident-stat-card">
          <div className="incident-stat-icon danger">
            <ShieldAlert size={20} />
          </div>

          <div>
            <p>Active Threats</p>
            <h3>3</h3>
          </div>
        </div>

        <div className="incident-stat-card">
          <div className="incident-stat-icon warning">
            <Clock3 size={20} />
          </div>

          <div>
            <p>Under Investigation</p>
            <h3>2</h3>
          </div>
        </div>

        <div className="incident-stat-card">
          <div className="incident-stat-icon success">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <p>Resolved Today</p>
            <h3>12</h3>
          </div>
        </div>

        <div className="incident-stat-card">
          <div className="incident-stat-icon neutral">
            <Radio size={20} />
          </div>

          <div>
            <p>Cameras Monitored</p>
            <h3>48</h3>
          </div>
        </div>
      </div>

      {/* AI Analytics Summary */}
      <div className="ai-monitoring-strip">
        <div className="ai-monitoring-item">
          <div className="ai-monitoring-icon">
            <ScanLine size={18} />
          </div>

          <div>
            <span>Perimeter Analytics</span>
            <strong>Operational</strong>
          </div>
        </div>

        <div className="ai-monitoring-item">
          <div className="ai-monitoring-icon">
            <Camera size={18} />
          </div>

          <div>
            <span>Connected CCTV</span>
            <strong>48 / 48 Online</strong>
          </div>
        </div>

        <div className="ai-monitoring-item">
          <div className="ai-monitoring-icon">
            <Eye size={18} />
          </div>

          <div>
            <span>AI Detection Engine</span>
            <strong>Running</strong>
          </div>
        </div>

        <div className="ai-monitoring-item">
          <div className="ai-monitoring-icon">
            <Siren size={18} />
          </div>

          <div>
            <span>Alert Pipeline</span>
            <strong>Real-time</strong>
          </div>
        </div>
      </div>

      {/* Incident Panel */}
      <div className="incidents-panel">
        <div className="incidents-panel-header">
          <div>
            <p className="panel-label">AI DETECTED EVENTS</p>
            <h3>Security Event Log</h3>
          </div>

          <div className="incident-count">
            {filteredIncidents.length} events
          </div>
        </div>

        {/* Filters */}
        <div className="incident-filters">
          <div className="incident-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search events, sectors, cameras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-wrapper">
            <Filter size={15} />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Incident List */}
        <div className="incident-list">
          {filteredIncidents.map((incident) => {
            const IncidentIcon = incident.icon;

            return (
              <div className="incident-row" key={incident.id}>
                {/* Event Icon */}
                <div
                  className={`incident-severity-icon ${incident.severity.toLowerCase()}`}
                >
                  <IncidentIcon size={19} />
                </div>

                {/* Main Information */}
                <div className="incident-main">
                  <div className="incident-title-row">
                    <h4>{incident.title}</h4>

                    <span
                      className={`severity-badge ${incident.severity.toLowerCase()}`}
                    >
                      {incident.severity}
                    </span>
                  </div>

                  <p className="incident-description">
                    {incident.description}
                  </p>

                  <div className="incident-meta">
                    <span>
                      <MapPin size={12} />
                      {incident.location}
                    </span>

                    <span>
                      <Camera size={12} />
                      {incident.camera}
                    </span>

                    <span>
                      <Clock3 size={12} />
                      {incident.time}
                    </span>

                    <span>
                      <ScanLine size={12} />
                      AI Confidence {incident.confidence}
                    </span>
                  </div>
                </div>

                {/* Right Information */}
                <div className="incident-right">
                  <span
                    className={`incident-status ${incident.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {incident.status}
                  </span>

                  <span className="incident-type">
                    {incident.type}
                  </span>

                  <span className="incident-id">
                    {incident.id}
                  </span>
                </div>

                {/* View */}
                <button
                  className="incident-view-btn"
                  title="View incident details"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            );
          })}

          {filteredIncidents.length === 0 && (
            <div className="no-incidents">
              <AlertTriangle size={28} />

              <h3>No security events found</h3>

              <p>
                Try changing your search criteria or incident filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Incidents;