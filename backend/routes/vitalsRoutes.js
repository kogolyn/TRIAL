import express from "express";
import Vitals from "../models/mongo/Vitals.mongo.js";

const router = express.Router();

router.post("/api/vitals", async (req, res) => {
  try {
    const vitals = await Vitals.create(req.body);

    if (global.ambulanceNotificationService) {
      if (vitals.isCritical) {
        await global.ambulanceNotificationService.notifyVitalsCritical(vitals.toJSON());
      } else {
        await global.ambulanceNotificationService.notifyVitalsRecorded(vitals.toJSON());
      }
    }

    return res.status(201).json(vitals);
  } catch (error) {
    return res.status(500).json({ message: "Failed to record vitals", error: error.message });
  }
});

router.get("/api/vitals/latest/:incidentId", async (req, res) => {
  try {
    const latest = await Vitals.findOne({ incidentId: req.params.incidentId }).sort({
      recordedAt: -1,
    });
    return res.json(latest);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch latest vitals", error: error.message });
  }
});

router.get("/api/vitals/patient/:patientCareId", async (req, res) => {
  try {
    const vitals = await Vitals.find({ patientCareId: req.params.patientCareId }).sort({
      recordedAt: -1,
    });
    return res.json(vitals);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch patient vitals", error: error.message });
  }
});

router.get("/api/vitals/critical/:ambulanceId", async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const vitals = await Vitals.find({
      ambulanceId: req.params.ambulanceId,
      isCritical: true,
      recordedAt: { $gte: since },
    }).sort({ recordedAt: -1 });
    return res.json(vitals);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch critical vitals", error: error.message });
  }
});

router.get("/api/vitals/:incidentId", async (req, res) => {
  try {
    const vitals = await Vitals.find({ incidentId: req.params.incidentId }).sort({
      recordedAt: -1,
    });
    return res.json(vitals);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch vitals", error: error.message });
  }
});

export default router;
