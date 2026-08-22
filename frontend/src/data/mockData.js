export const dashboardData = {
    stats: {
        totalDetections: 12,
        highRiskEvents: 3,
        activeAlerts: 1,
    },

    currentDetection: {
        detected: true,
        confidence: 94,
        location: "Hostel Block A",
        risk: "HIGH",
        time: "2 min ago",
    },

    response: {
        status: "ACTIVATED",
        message: "Preventive response initiated",
    },

    recentDetections: [
        {
            id: 1,
            location: "Hostel Block A",
            confidence: 94,
            risk: "HIGH",
            time: "2 min ago",
        },
        {
            id: 2,
            location: "Cafeteria",
            confidence: 89,
            risk: "MEDIUM",
            time: "18 min ago",
        },
        {
            id: 3,
            location: "Main Gate",
            confidence: 91,
            risk: "LOW",
            time: "42 min ago",
        },
    ],
};