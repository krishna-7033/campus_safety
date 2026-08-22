// src/data/monkeyDetectionData.js
//
// MOCK DATA LAYER for the Analytics Page.
// -----------------------------------------------------------------
// This file simulates what a real backend/API would eventually return.
// Everything is exported through small "getX()" functions instead of
// raw arrays, so when the backend is ready, each function body can be
// swapped for a `fetch("/api/...")` call WITHOUT touching AnalyticsPage.jsx.
//
// Example future upgrade:
//   export async function getDailyDetections() {
//     const res = await fetch("/api/analytics/daily");
//     return res.json();
//   }
// -----------------------------------------------------------------

// Raw detection events (what a camera/model pipeline would log per sighting)
export const rawDetections = [
  { id: 1, date: "2026-08-16", time: "06:42", zone: "Hostel Block A", camera: "CAM-04", confidence: 0.91, severity: "medium", count: 2 },
  { id: 2, date: "2026-08-16", time: "12:15", zone: "Canteen", camera: "CAM-11", confidence: 0.87, severity: "high", count: 4 },
  { id: 3, date: "2026-08-16", time: "17:03", zone: "Library Lawn", camera: "CAM-02", confidence: 0.76, severity: "low", count: 1 },
  { id: 4, date: "2026-08-17", time: "07:20", zone: "Hostel Block A", camera: "CAM-04", confidence: 0.94, severity: "high", count: 5 },
  { id: 5, date: "2026-08-17", time: "09:45", zone: "Academic Block", camera: "CAM-07", confidence: 0.68, severity: "low", count: 1 },
  { id: 6, date: "2026-08-17", time: "18:30", zone: "Canteen", camera: "CAM-11", confidence: 0.83, severity: "medium", count: 3 },
  { id: 7, date: "2026-08-18", time: "06:55", zone: "Sports Ground", camera: "CAM-09", confidence: 0.79, severity: "medium", count: 2 },
  { id: 8, date: "2026-08-18", time: "13:10", zone: "Library Lawn", camera: "CAM-02", confidence: 0.88, severity: "high", count: 6 },
  { id: 9, date: "2026-08-18", time: "19:22", zone: "Hostel Block B", camera: "CAM-05", confidence: 0.71, severity: "low", count: 1 },
  { id: 10, date: "2026-08-19", time: "07:05", zone: "Canteen", camera: "CAM-11", confidence: 0.92, severity: "high", count: 4 },
  { id: 11, date: "2026-08-19", time: "11:40", zone: "Academic Block", camera: "CAM-07", confidence: 0.65, severity: "low", count: 1 },
  { id: 12, date: "2026-08-19", time: "16:18", zone: "Hostel Block A", camera: "CAM-04", confidence: 0.85, severity: "medium", count: 3 },
  { id: 13, date: "2026-08-20", time: "06:30", zone: "Sports Ground", camera: "CAM-09", confidence: 0.9, severity: "high", count: 5 },
  { id: 14, date: "2026-08-20", time: "14:52", zone: "Library Lawn", camera: "CAM-02", confidence: 0.73, severity: "low", count: 2 },
  { id: 15, date: "2026-08-20", time: "20:11", zone: "Hostel Block B", camera: "CAM-05", confidence: 0.8, severity: "medium", count: 2 },
  { id: 16, date: "2026-08-21", time: "07:15", zone: "Canteen", camera: "CAM-11", confidence: 0.95, severity: "high", count: 7 },
  { id: 17, date: "2026-08-21", time: "12:48", zone: "Academic Block", camera: "CAM-07", confidence: 0.7, severity: "low", count: 1 },
  { id: 18, date: "2026-08-21", time: "17:35", zone: "Hostel Block A", camera: "CAM-04", confidence: 0.89, severity: "high", count: 4 },
  { id: 19, date: "2026-08-22", time: "06:50", zone: "Sports Ground", camera: "CAM-09", confidence: 0.77, severity: "medium", count: 2 },
  { id: 20, date: "2026-08-22", time: "10:20", zone: "Library Lawn", camera: "CAM-02", confidence: 0.82, severity: "medium", count: 3 },
];

// --- Derived / aggregate helpers -----------------------------------

// Detections grouped by day (for trend line chart)
export function getDailyDetections() {
  const grouped = {};
  rawDetections.forEach((d) => {
    grouped[d.date] = (grouped[d.date] || 0) + d.count;
  });
  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}

// Detections grouped by campus zone (for bar chart)
export function getZoneBreakdown() {
  const grouped = {};
  rawDetections.forEach((d) => {
    grouped[d.zone] = (grouped[d.zone] || 0) + d.count;
  });
  return Object.entries(grouped).map(([zone, count]) => ({ zone, count }));
}

// Detections grouped by severity (for pie chart)
export function getSeverityBreakdown() {
  const grouped = { low: 0, medium: 0, high: 0 };
  rawDetections.forEach((d) => {
    grouped[d.severity] += d.count;
  });
  return [
    { name: "Low", value: grouped.low },
    { name: "Medium", value: grouped.medium },
    { name: "High", value: grouped.high },
  ];
}

// Detections grouped by hour of day (for peak-activity chart)
export function getHourlyPattern() {
  const buckets = {
    "Early Morning (5-8)": 0,
    "Morning (8-12)": 0,
    "Afternoon (12-16)": 0,
    "Evening (16-19)": 0,
    "Night (19-24)": 0,
  };
  rawDetections.forEach((d) => {
    const hour = parseInt(d.time.split(":")[0], 10);
    if (hour >= 5 && hour < 8) buckets["Early Morning (5-8)"] += d.count;
    else if (hour >= 8 && hour < 12) buckets["Morning (8-12)"] += d.count;
    else if (hour >= 12 && hour < 16) buckets["Afternoon (12-16)"] += d.count;
    else if (hour >= 16 && hour < 19) buckets["Evening (16-19)"] += d.count;
    else buckets["Night (19-24)"] += d.count;
  });
  return Object.entries(buckets).map(([label, count]) => ({ label, count }));
}

// Per-camera reliability / activity (for a table or ranked list)
export function getCameraStats() {
  const grouped = {};
  rawDetections.forEach((d) => {
    if (!grouped[d.camera]) {
      grouped[d.camera] = { camera: d.camera, zone: d.zone, detections: 0, totalConfidence: 0 };
    }
    grouped[d.camera].detections += 1;
    grouped[d.camera].totalConfidence += d.confidence;
  });
  return Object.values(grouped)
    .map((c) => ({
      ...c,
      avgConfidence: Math.round((c.totalConfidence / c.detections) * 100),
    }))
    .sort((a, b) => b.detections - a.detections);
}

// Top-line summary stats (for stat cards at the top of the page)
export function getSummaryStats() {
  const totalSightings = rawDetections.reduce((sum, d) => sum + d.count, 0);
  const totalEvents = rawDetections.length;
  const highSeverityEvents = rawDetections.filter((d) => d.severity === "high").length;
  const avgConfidence = Math.round(
    (rawDetections.reduce((sum, d) => sum + d.confidence, 0) / rawDetections.length) * 100
  );
  const busiestZone = getZoneBreakdown().sort((a, b) => b.count - a.count)[0]?.zone ?? "N/A";

  return {
    totalSightings,
    totalEvents,
    highSeverityEvents,
    avgConfidence,
    busiestZone,
  };
}