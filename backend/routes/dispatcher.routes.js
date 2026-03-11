import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  addEmergencyNote,
  assignAmbulance,
  assignDestinationHospital,
  calculateIncidentEta,
  cancelEmergency,
  createAmbulance,
  createOrUpdateHospitalProfile,
  createIncidentReport,
  getAmbulances,
  getDashboardAnalytics,
  getEmergencyTimeline,
  getHospitalAvailability,
  getHospitals,
  getIncidents,
  getMapData,
  getNearbyAmbulances,
  getNearbyHospitals,
  reassignAmbulance,
  getStats,
  notifyHospital,
  updateAmbulanceLocation,
  updateEmergencyPriority,
  updateIncidentStatus,
  verifyEmergency,
} from "../Controllers/dispatcher/dispatcher.controller.js";

const router = express.Router();

// Public endpoint for one-tap emergency reporting
router.post("/incidents/report", createIncidentReport);

// Dispatcher/admin protected endpoints
router.get("/incidents", requireAuth, requireRole("dispatcher", "admin"), getIncidents);
router.patch("/incidents/:id/verify", requireAuth, requireRole("dispatcher", "admin"), verifyEmergency);
router.patch("/incidents/:id/priority", requireAuth, requireRole("dispatcher", "admin"), updateEmergencyPriority);
router.post("/incidents/:id/notes", requireAuth, requireRole("dispatcher", "admin"), addEmergencyNote);
router.patch("/incidents/:id/cancel", requireAuth, requireRole("dispatcher", "admin"), cancelEmergency);
router.get("/incidents/:id/timeline", requireAuth, requireRole("dispatcher", "admin", "ambulance"), getEmergencyTimeline);
router.get("/map", requireAuth, requireRole("dispatcher", "admin"), getMapData);
router.get("/ambulances", requireAuth, requireRole("dispatcher", "admin"), getAmbulances);
router.get("/ambulances/nearby", requireAuth, requireRole("dispatcher", "admin"), getNearbyAmbulances);
router.post("/ambulances", requireAuth, requireRole("dispatcher", "admin"), createAmbulance);
router.patch("/ambulances/:id/location", requireAuth, requireRole("dispatcher", "admin", "ambulance"), updateAmbulanceLocation);
router.get("/hospitals/nearby", requireAuth, requireRole("dispatcher", "admin"), getNearbyHospitals);
router.post("/hospitals/profiles", requireAuth, requireRole("dispatcher", "admin"), createOrUpdateHospitalProfile);
router.get("/hospitals", requireAuth, requireRole("dispatcher", "admin"), getHospitals);
router.get("/hospitals/:id/availability", requireAuth, requireRole("dispatcher", "admin", "medical"), getHospitalAvailability);
router.get("/stats", requireAuth, requireRole("dispatcher", "admin"), getStats);
router.get("/dashboard", requireAuth, requireRole("dispatcher", "admin"), getDashboardAnalytics);
router.post("/incidents/:id/assign", requireAuth, requireRole("dispatcher", "admin"), assignAmbulance);
router.post("/incidents/:id/reassign", requireAuth, requireRole("dispatcher", "admin"), reassignAmbulance);
router.post("/incidents/:id/notify-hospital", requireAuth, requireRole("dispatcher", "admin"), notifyHospital);
router.post("/incidents/:id/destination", requireAuth, requireRole("dispatcher", "admin"), assignDestinationHospital);
router.get("/incidents/:id/eta", requireAuth, requireRole("dispatcher", "admin", "ambulance"), calculateIncidentEta);

// Ambulance crews can push status updates on assigned incidents
router.patch("/incidents/:id/status", requireAuth, requireRole("dispatcher", "admin", "ambulance"), updateIncidentStatus);

export default router;
