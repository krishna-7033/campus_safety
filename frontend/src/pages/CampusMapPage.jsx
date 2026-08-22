import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/campus_map.css";

// Fix Leaflet marker icons in React/Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Campus center
// Change these coordinates to your actual campus location
const CAMPUS_CENTER = [31.01638, 77.07065];

const surveillanceEvents = [
  {
    id: 1,
    cameraId: "BOP-CAM-01",
    location: "Border Out Post 01",
    type: "human",
    label: "Human Detected",
    severity: "high",
    position: [31.01675, 77.07040],
    confidence: 94,
    time: "2 min ago",
  },
  {
    id: 2,
    cameraId: "BOP-CAM-02",
    location: "Border Road Checkpoint",
    type: "vehicle",
    label: "Vehicle Detected",
    severity: "medium",
    position: [31.01605, 77.07110],
    confidence: 91,
    time: "7 min ago",
  },
  {
    id: 3,
    cameraId: "BOP-CAM-03",
    location: "Strategic Point A",
    type: "intrusion",
    label: "Virtual Fence Breach",
    severity: "high",
    position: [31.01635, 77.07055],
    confidence: 97,
    time: "15 min ago",
  },
  {
    id: 4,
    cameraId: "BOP-CAM-04",
    location: "Border Road",
    type: "night",
    label: "Night Movement",
    severity: "medium",
    position: [31.01570, 77.06995],
    confidence: 88,
    time: "22 min ago",
  },
  {
    id: 5,
    cameraId: "BOP-CAM-05",
    location: "Check Post",
    type: "vehicle",
    label: "Vehicle Detected",
    severity: "low",
    position: [31.01695, 77.07305],
    confidence: 90,
    time: "35 min ago",
  },
];
const facilities = [
  {
    name: "Security Office",
    type: "security",
    position: [30.8502, 77.1758],
  },
  {
    name: "CCTV Camera",
    type: "cctv",
    position: [30.8513, 77.1752],
  },
  {
    name: "First Aid Center",
    type: "medical",
    position: [30.8515, 77.1742],
  },
];
function createEventIcon(type, severity) {
  const icons = {
    human: "👤",
    vehicle: "🚗",
    intrusion: "🚨",
    night: "🌙",
  };

  const icon = icons[type] || "📍";

  return L.divIcon({
    className: "event-marker-container",
    html: `
      <div class="event-marker event-${severity}">
        <span>${icon}</span>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}
function createFacilityIcon(type) {
  const icons = {
    security: "🛡️",
    cctv: "📹",
    medical: "⚕️",
  };

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="map-marker marker-${type}">
        ${icons[type] || "📍"}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

function MapController({ selectedLocation }) {
  const map = useMap();

  if (selectedLocation) {
    map.flyTo(selectedLocation, 17, {
      duration: 1.2,
    });
  }

  return null;
}

function CampusMapPage() {
  const [filter, setFilter] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const filteredEvents =
    filter === "all"
      ? surveillanceEvents
      : surveillanceEvents.filter((event) => event.severity === filter);

  const selectLocation = (position) => {
    setSelectedLocation(position);
  };

  return (
    <div className="campus-map-page">
      {/* Header */}
      <div className="map-header">
        <div>
          <p className="eyebrow">BORDER MONITORING</p>

          <h1>Border Surveillance Map</h1>

          <p className="map-subtitle">
            Real-time AI-powered surveillance across strategic border locations.
          </p>
        </div>

        <div className="map-status">
          <span className="status-dot"></span>
          LIVE MONITORING
        </div>
      </div>

      {/* Statistics */}
      <div className="map-stats">

  <div className="stat-card">
    <div className="stat-icon red">🐒</div>
    <div>
      <span>Active Cameras</span>
      <strong>12</strong>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon red">⚠️</div>
    <div>
      <span>Active Threats</span>
      <strong>2</strong>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon yellow">⚠️</div>
    <div>
      <span>Humans Detected</span>
      <strong>8</strong>
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-icon blue">🛡️</div>
    <div>
      <span>Vehicles Detected</span>
      <strong>5</strong>
    </div>
  </div>

</div>

      {/* Map section */}
      <div className="map-layout">
        <div className="map-wrapper">
          <MapContainer
            center={CAMPUS_CENTER}
            zoom={16}
            scrollWheelZoom={true}
            className="campus-leaflet-map"
          >
            <TileLayer
  attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
/>

            <MapController selectedLocation={selectedLocation} />

            {/* High risk zone */}
            <Circle
              center={[30.852, 77.176]}
              radius={180}
              pathOptions={{
                color: "#ef4444",
                fillColor: "#ef4444",
                fillOpacity: 0.18,
                weight: 2,
              }}
            />

            {/* Medium risk zone */}
            <Circle
              center={[30.8505, 77.174]}
              radius={140}
              pathOptions={{
                color: "#f59e0b",
                fillColor: "#f59e0b",
                fillOpacity: 0.16,
                weight: 2,
              }}
            />

            {/* Incident markers */}
           {/* Surveillance events */}
{/* Surveillance events */}
{filteredEvents.map((event) => (
   <React.Fragment key={event.id}>

    <Circle
      center={event.position}
      radius={
        event.severity === "high"
          ? 80
          : event.severity === "medium"
          ? 60
          : 40
      }
      pathOptions={{
        color:
          event.severity === "high"
            ? "#ef4444"
            : event.severity === "medium"
            ? "#f59e0b"
            : "#22c55e",
        fillColor:
          event.severity === "high"
            ? "#ef4444"
            : event.severity === "medium"
            ? "#f59e0b"
            : "#22c55e",
        fillOpacity: 0.12,
        weight: 2,
      }}
    />

  <Marker
    key={event.id}
    position={event.position}
    icon={createEventIcon(event.type, event.severity)}
    eventHandlers={{
      click: () => setSelectedLocation(event.position),
    }}
  >
    <Popup>
      <strong>📹 {event.label}</strong>
      <br />
      Camera: {event.cameraId}
      <br />
      Location: {event.location}
      <br />
      Confidence: {event.confidence}%
      <br />
      Severity: {event.severity.toUpperCase()}
      <br />
      <small>{event.time}</small>
    </Popup>
  </Marker>
      </React.Fragment>
))}


            {/* Security / CCTV / medical markers */}
            {facilities.map((facility, index) => (
              <Marker
                key={index}
                position={facility.position}
                icon={createFacilityIcon(facility.type)}
              >
                <Popup>
                  <strong>{facility.name}</strong>
                  <br />
                  Campus safety facility
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map legend */}
          <div className="map-legend">
            <h4>Risk Level</h4>

            <div>
              <span className="legend-dot high"></span>
              High Risk
            </div>

            <div>
              <span className="legend-dot medium"></span>
              Medium Risk
            </div>

            <div>
              <span className="legend-dot low"></span>
              Safe
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="risk-panel">
          <div className="panel-heading">
            <div>
              <span>LIVE MONITORING</span>
              <h3>Threat Activity</h3>
            </div>

            <span className="live-badge">LIVE</span>
          </div>

          {/* Filters */}
          <div className="map-filters">
  <button
    className={filter === "all" ? "active" : ""}
    onClick={() => setFilter("all")}
  >
    All
  </button>

  <button
    className={filter === "high" ? "active" : ""}
    onClick={() => setFilter("high")}
  >
    High Risk
  </button>

  <button
    className={filter === "medium" ? "active" : ""}
    onClick={() => setFilter("medium")}
  >
    Medium
  </button>

  <button
    className={filter === "low" ? "active" : ""}
    onClick={() => setFilter("low")}
  >
    Low Risk
  </button>
</div>

          {/* Incident list */}
        {/* Surveillance event list */}
<div className="incident-list">
  {filteredEvents.map((event) => (
    <button
      className="incident-card"
      key={event.id}
      onClick={() => selectLocation(event.position)}
    >
      <div className={`incident-indicator ${event.severity}`}>
        {event.type === "human"
          ? "👤"
          : event.type === "vehicle"
          ? "🚗"
          : event.type === "intrusion"
          ? "🚨"
          : "🌙"}
      </div>

      <div className="incident-info">
        <strong>{event.cameraId}</strong>

        <span>{event.label}</span>

        <small>
          {event.location} • {event.confidence}% confidence
        </small>

        <small>
          {event.severity === "high"
            ? "🔴 High Risk"
            : event.severity === "medium"
            ? "🟡 Medium Risk"
            : "🟢 Low Risk"}{" "}
          • {event.time}
        </small>
      </div>

      <span className="arrow">›</span>
    </button>
  ))}
</div>

          {/* Facilities */}
          <div className="facilities-section">
            <h4>Safety Facilities</h4>

            <div className="facility-row">
              <span>🛡️</span>
              <div>
                <strong>Security Posts</strong>
                <small>4 active locations</small>
              </div>
            </div>

            <div className="facility-row">
              <span>📹</span>
              <div>
                <strong>CCTV Network</strong>
                <small>24 cameras online</small>
              </div>
            </div>

            <div className="facility-row">
              <span>⚕️</span>
              <div>
                <strong>First Aid</strong>
                <small>2 centers available</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampusMapPage;
