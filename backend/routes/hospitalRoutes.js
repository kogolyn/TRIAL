import express from "express";
import mongoose from "mongoose";

const router = express.Router();
const toObjectId = (id) => (id && mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null);

router.post("/:id/accept", async (req, res) => {
  try {
    const { emergencyId, assignedBed, eta } = req.body;

    if (!emergencyId) {
      return res.status(400).json({ success: false, message: "emergencyId is required" });
    }

    const hospitalId = toObjectId(req.params.id);
    const emergencyObjectId = toObjectId(emergencyId);
    if (!hospitalId || !emergencyObjectId) {
      return res.status(400).json({ success: false, message: "Invalid hospital or emergency id" });
    }

    const hospital = {
      _id: hospitalId,
      name: req.body.name || "Receiving Hospital",
      assignedBed,
      eta,
    };

    const emergency = {
      _id: emergencyObjectId,
      location: req.body.location || "unknown",
      description: req.body.description || "No description",
    };

    if (global.notificationService) {
      await global.notificationService.notifyHospitalAccepted(hospital, emergency);
    }

    return res.status(200).json({ success: true, message: "Hospital acceptance recorded", data: { hospital, emergency } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:id/capacity-alert", async (req, res) => {
  try {
    const { capacityPercentage } = req.body;

    if (capacityPercentage === undefined) {
      return res.status(400).json({ success: false, message: "capacityPercentage is required" });
    }

    const hospitalId = toObjectId(req.params.id);
    if (!hospitalId) {
      return res.status(400).json({ success: false, message: "Invalid hospital id" });
    }

    const hospital = {
      _id: hospitalId,
      name: req.body.name || "Hospital",
      capacityPercentage,
    };

    if (global.notificationService) {
      await global.notificationService.notifyHospitalCapacityWarning(hospital);
    }

    return res.status(200).json({ success: true, message: "Capacity warning sent", data: hospital });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const data = [
      { _id: new mongoose.Types.ObjectId(), name: "City General", assignedBed: "B12", eta: "10 mins", capacityPercentage: 82 },
      { _id: new mongoose.Types.ObjectId(), name: "St. Mary", assignedBed: "A03", eta: "6 mins", capacityPercentage: 91 },
    ];

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
