// src/data/surveillanceDetectionData.js
//
// MOCK DATA LAYER for the Analytics Page.
// -----------------------------------------------------------------
// Simulates what the real detection backend (CV model running on
// existing CCTV feeds) would eventually return for border surveillance.
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

// Raw detection events (what the CV pipeline would log per event)
export const rawDetections = [
  { id: 1, date: "2026-08-16", time: "02:42", sector: "Sector A - North Fence", camera: "CAM-04", type: "Human", confidence: 0.91, threatLevel: "medium", count: 1 },
  { id: 2, date: "2026-08-16", time: "04:15", sector: "Sector C - River Crossing", camera: "CAM-11", type: "Vehicle", confidence: 0.87, threatLevel: "high", count: 1 },
  { id: 3, date: "2026-08-16", time: "17:03", sector: "Sector B - Watchtower 2", camera: "CAM-02", type: "Animal", confidence: 0.76, threatLevel: "low", count: 2 },
  { id: 4, date: "2026-08-17", time: "01:20", sector: "Sector A - North Fence", camera: "CAM-04", type: "Human", confidence: 0.94, threatLevel: "high", count: 3 },
  { id: 5, date: "2026-08-17", time: "09:45", sector: "Sector D - Access Road", camera: "CAM-07", type: "Vehicle", confidence: 0.68, threatLevel: "low", count: 1 },
  { id: 6, date: "2026-08-17", time: "22:30", sector: "Sector C - River Crossing", camera: "CAM-11", type: "Human", confidence: 0.83, threatLevel: "medium", count: 2 },
  { id: 7, date: "2026-08-18", time: "03:55", sector: "Sector E - Ridge Line", camera: "CAM-09", type: "Human", confidence: 0.79, threatLevel: "medium", count: 1 },
  { id: 8, date: "2026-08-18", time: "13:10", sector: "Sector B - Watchtower 2", camera: "CAM-02", type: "Vehicle", confidence: 0.88, threatLevel: "high", count: 1 },
  { id: 9, date: "2026-08-18", time: "23:22", sector: "Sector F - South Perimeter", camera: "CAM-05", type: "Animal", confidence: 0.71, threatLevel: "low", count: 1 },
  { id: 10, date: "2026-08-19", time: "01:05", sector: "Sector C - River Crossing", camera: "CAM-11", type: "Human", confidence: 0.92, threatLevel: "high", count: 2 },
  { id: 11, date: "2026-08-19", time: "11:40", sector: "Sector D - Access Road", camera: "CAM-07", type: "Vehicle", confidence: 0.65, threatLevel: "low", count: 1 },
  { id: 12, date: "2026-08-19", time: "16:18", sector: "Sector A - North Fence", camera: "CAM-04", type: "Human", confidence: 0.85, threatLevel: "medium", count: 1 },
  { id: 13, date: "2026-08-20", time: "02:30", sector: "Sector E - Ridge Line", camera: "CAM-09", type: "Human", confidence: 0.9, threatLevel: "high", count: 2 },
  { id: 14, date: "2026-08-20", time: "14:52", sector: "Sector B - Watchtower 2", camera: "CAM-02", type: "Animal", confidence: 0.73, threatLevel: "low", count: 1 },
  { id: 15, date: "2026-08-20", time: "20:11", sector: "Sector F - South Perimeter", camera: "CAM-05", type: "Vehicle", confidence: 0.8, threatLevel: "medium", count: 1 },
  { id: 16, date: "2026-08-21", time: "03:15", sector: "Sector C - River Crossing", camera: "CAM-11", type: "Human", confidence: 0.95, threatLevel: "high", count: 3 },
  { id: 17, date: "2026-08-21", time: "12:48", sector: "Sector D - Access Road", camera: "CAM-07", type: "Vehicle", confidence: 0.7, threatLevel: "low", count: 1 },
  { id: 18, date: "2026-08-21", time: "23:35", sector: "Sector A - North Fence", camera: "CAM-04", type: "Human", confidence: 0.89, threatLevel: "high", count: 2 },
  { id: 19, date: "2026-08-22", time: "04:50", sector: "Sector E - Ridge Line", camera: "CAM-09", type: "Human", confidence: 0.77, threatLevel: "medium", count: 1 },
  { id: 20, date: "2026-08-22", time: "10:20", sector: "Sector B - Watchtower 2", camera: "CAM-02", type: "Animal", confidence: 0.82, threatLevel: "medium", count: 1 },
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

// Detections grouped by sector (for bar chart)
export function getSectorBreakdown() {
  const grouped = {};
  rawDetections.forEach((d) => {
    grouped[d.sector] = (grouped[d.sector] || 0) + d.count;
  });
  return Object.entries(grouped).map(([sector, count]) => ({ sector, count }));
}

// Detections grouped by threat level (for pie chart)
export function getThreatLevelBreakdown() {
  const grouped = { low: 0, medium: 0, high: 0 };
  rawDetections.forEach((d) => {
    grouped[d.threatLevel] += d.count;
  });
  return [
    { name: "Low", value: grouped.low },
    { name: "Medium", value: grouped.medium },
    { name: "High", value: grouped.high },
  ];
}

// Detections grouped by object type (Human / Vehicle / Animal)
export function getTypeBreakdown() {
  const grouped = {};
  rawDetections.forEach((d) => {
    grouped[d.type] = (grouped[d.type] || 0) + d.count;
  });
  return Object.entries(grouped).map(([type, count]) => ({ type, count }));
}

// Detections grouped by hour of day (for peak-activity chart)
export function getHourlyPattern() {
  const buckets = {
    "Late Night (0-4)": 0,
    "Early Morning (4-8)": 0,
    "Day (8-16)": 0,
    "Evening (16-20)": 0,
    "Night (20-24)": 0,
  };
  rawDetections.forEach((d) => {
    const hour = parseInt(d.time.split(":")[0], 10);
    if (hour >= 0 && hour < 4) buckets["Late Night (0-4)"] += d.count;
    else if (hour >= 4 && hour < 8) buckets["Early Morning (4-8)"] += d.count;
    else if (hour >= 8 && hour < 16) buckets["Day (8-16)"] += d.count;
    else if (hour >= 16 && hour < 20) buckets["Evening (16-20)"] += d.count;
    else buckets["Night (20-24)"] += d.count;
  });
  return Object.entries(buckets).map(([label, count]) => ({ label, count }));
}

// Per-camera activity / reliability (for a table or ranked list)
export function getCameraStats() {
  const grouped = {};
  rawDetections.forEach((d) => {
    if (!grouped[d.camera]) {
      grouped[d.camera] = { camera: d.camera, sector: d.sector, detections: 0, totalConfidence: 0 };
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
  const totalDetections = rawDetections.reduce((sum, d) => sum + d.count, 0);
  const totalEvents = rawDetections.length;
  const highThreatEvents = rawDetections.filter((d) => d.threatLevel === "high").length;
  const avgConfidence = Math.round(
    (rawDetections.reduce((sum, d) => sum + d.confidence, 0) / rawDetections.length) * 100
  );
  const mostActiveSector = getSectorBreakdown().sort((a, b) => b.count - a.count)[0]?.sector ?? "N/A";

  return {
    totalDetections,
    totalEvents,
    highThreatEvents,
    avgConfidence,
    mostActiveSector,
  };
}