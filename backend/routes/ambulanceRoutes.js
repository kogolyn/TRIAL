import express from "express";
import mongoose from "mongoose";

const router = express.Router();
const toObjectId = (id) => (id && mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null);

router.put("/:id/status", async (req, res) => {
  try {
    const { status, emergencyId, eta } = req.body;

    if (!status || !emergencyId) {
      return res.status(400).json({ success: false, message: "status and emergencyId are required" });
    }

    const ambulanceId = toObjectId(req.params.id);
    const emergencyObjectId = toObjectId(emergencyId);
    if (!ambulanceId || !emergencyObjectId) {
      return res.status(400).json({ success: false, message: "Invalid ambulance or emergency id" });
    }

    const ambulance = {
      _id: ambulanceId,
      vehicleNumber: req.body.vehicleNumber || "AMB-UNKNOWN",
      status,
      eta,
    };

    const emergency = {
      _id: emergencyObjectId,
      location: req.body.location || "unknown",
      reporterId: toObjectId(req.body.reporterId) || undefined,
    };

    if (global.notificationService) {
      if (status === "enroute") {
        await global.notificationService.notifyAmbulanceEnRoute(ambulance, emergency);
      }

      if (status === "arrived") {
        await global.notificationService.notifyAmbulanceArrived(ambulance, emergency);
      }
    }

    return res.status(200).json({ success: true, message: "Ambulance status updated", data: ambulance });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const data = [
      { _id: new mongoose.Types.ObjectId(), vehicleNumber: "AMB-001", status: "available", eta: null },
      { _id: new mongoose.Types.ObjectId(), vehicleNumber: "AMB-002", status: "enroute", eta: "8 mins" },
    ];

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
