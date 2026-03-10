import express from 'express';
const router = express.Router();

// Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    // TODO: Replace with actual database queries
    const stats = {
      totalEmergencies: 1247,
      activeAmbulances: 87,
      registeredHospitals: 156,
      avgResponseTime: '8.5 min',
      resolvedToday: 47,
      pendingRegistrations: 12,
      systemUptime: '99.97%',
      activeUsers: 2341,
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics Data
router.get('/analytics', async (req, res) => {
  try {
    const analytics = {
      monthlyData: [
        { month: 'Jan', emergencies: 320, resolved: 305, avgTime: 12 },
        { month: 'Feb', emergencies: 420, resolved: 410, avgTime: 10 },
        { month: 'Mar', emergencies: 380, resolved: 370, avgTime: 11 },
        { month: 'Apr', emergencies: 450, resolved: 438, avgTime: 9 },
        { month: 'May', emergencies: 510, resolved: 495, avgTime: 8 },
        { month: 'Jun', emergencies: 480, resolved: 472, avgTime: 8 },
      ],
      countyData: [
        { county: 'Nairobi', emergencies: 520 },
        { county: 'Mombasa', emergencies: 180 },
        { county: 'Kisumu', emergencies: 140 },
        { county: 'Nakuru', emergencies: 120 },
        { county: 'Eldoret', emergencies: 95 },
      ],
    };
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    // TODO: Replace with actual User.find()
    const users = [
      { id: 1, name: 'System Admin', email: 'admin@emergency.ke', phone: '+254 700 000 000', role: 'Super Admin', status: 'active' },
      { id: 2, name: 'John Kamau', email: 'john.k@emergency.ke', phone: '+254 712 345 678', role: 'Verifier', status: 'active' },
    ];
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system logs
router.get('/logs', async (req, res) => {
  try {
    // TODO: Replace with actual database query
    const logs = [
      { id: 1, timestamp: new Date().toISOString(), level: 'info', category: 'authentication', user: 'admin@emergency.ke', action: 'User logged in', ip: '102.68.75.23' },
      { id: 2, timestamp: new Date().toISOString(), level: 'success', category: 'registration', user: 'john.k@emergency.ke', action: 'Hospital registered', ip: '102.68.75.24' },
    ];
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Live ambulances
router.get('/ambulances/live', async (req, res) => {
  try {
    // TODO: Replace with actual ambulance tracking data
    const ambulances = [
      { id: 1, plate: 'KBZ 123A', status: 'en-route', location: 'Westlands', lat: -1.2674, lng: 36.8022, patient: 'Cardiac', distance: '2.3 km', eta: '5 min' },
      { id: 2, plate: 'KCA 456B', status: 'available', location: 'CBD', lat: -1.2864, lng: 36.8172, patient: '-', distance: '-', eta: '-' },
    ];
    res.json(ambulances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;