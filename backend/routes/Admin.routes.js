import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getAdminStats,
  getAdminAnalytics,
  getAdminUsers,
  getAdminLogs,
  getAdminLiveAmbulances,
  getAdminHospitals,
  createHospitalRegistration,
  createAmbulanceRegistration,
  getRegistrations,
  approveRegistration,
  rejectRegistration,
  updateHospitalResources,
  resetUserPassword,
} from "../Controllers/admin/admin.controller.js";

const router = express.Router();

router.get("/stats", requireAuth, requireRole("admin"), getAdminStats);
router.get("/analytics", requireAuth, requireRole("admin"), getAdminAnalytics);
router.get("/users", requireAuth, requireRole("admin"), getAdminUsers);
router.get("/logs", requireAuth, requireRole("admin"), getAdminLogs);
router.get("/ambulances/live", requireAuth, requireRole("admin"), getAdminLiveAmbulances);
router.get("/hospitals", requireAuth, requireRole("admin"), getAdminHospitals);
router.post("/registrations/hospital", requireAuth, requireRole("admin"), createHospitalRegistration);
router.post("/registrations/ambulance", requireAuth, requireRole("admin"), createAmbulanceRegistration);
router.get("/registrations", requireAuth, requireRole("admin"), getRegistrations);
router.patch("/registrations/:id/approve", requireAuth, requireRole("admin"), approveRegistration);
router.patch("/registrations/:id/reject", requireAuth, requireRole("admin"), rejectRegistration);
router.patch("/hospitals/:id/resources", requireAuth, requireRole("admin"), updateHospitalResources);
router.patch("/users/:id/reset-password", requireAuth, requireRole("admin"), resetUserPassword);

export default router;
