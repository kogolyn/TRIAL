import express from "express";
import mongoose from "mongoose";

const router = express.Router();
const toObjectId = (id) => (id && mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null);

router.post("/", async (req, res) => {
  try {
    const emergency = {
      _id: new mongoose.Types.ObjectId(),
      location: req.body.location,
      description: req.body.description,
      severity: req.body.severity || "unknown",
      reporterId: toObjectId(req.body.reporterId) || undefined,
      status: "reported",
      createdAt: new Date(),
    };

    if (global.notificationService) {
      await global.notificationService.notifyEmergencyReported(emergency);
    }

    return res.status(201).json({
      success: true,
      message: "Emergency reported successfully",
      data: emergency,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/assign-ambulance", async (req, res) => {
  try {
    const { ambulanceId } = req.body;
    if (!ambulanceId) {
      return res.status(400).json({ success: false, message: "ambulanceId is required" });
    }

    const emergencyId = toObjectId(req.params.id);
    const ambulanceObjectId = toObjectId(ambulanceId);

    if (!emergencyId || !ambulanceObjectId) {
      return res.status(400).json({ success: false, message: "Invalid emergency or ambulance id" });
    }

    const emergency = {
      _id: emergencyId,
      severity: req.body.severity || "unknown",
      location: req.body.location || "unknown",
      reporterId: toObjectId(req.body.reporterId) || undefined,
    };

    const ambulance = {
      _id: ambulanceObjectId,
      vehicleNumber: req.body.vehicleNumber || "AMB-UNKNOWN",
      status: "assigned",
      eta: req.body.eta,
      userId: toObjectId(req.body.ambulanceUserId) || undefined,
    };

    if (global.notificationService) {
      await global.notificationService.notifyAmbulanceAssigned(emergency, ambulance);
    }

    return res.status(200).json({ success: true, message: "Ambulance assigned successfully", data: { emergency, ambulance } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/resolve", async (req, res) => {
  try {
    const emergencyId = toObjectId(req.params.id);
    if (!emergencyId) {
      return res.status(400).json({ success: false, message: "Invalid emergency id" });
    }

    const emergency = {
      _id: emergencyId,
      location: req.body.location || "unknown",
      description: req.body.description || "No description",
      reporterId: toObjectId(req.body.reporterId) || undefined,
      status: "resolved",
    };

    if (global.notificationService) {
      await global.notificationService.notifyEmergencyResolved(emergency);
    }

    return res.status(200).json({ success: true, message: "Emergency resolved successfully", data: emergency });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
