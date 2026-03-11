import express from "express";
import AmbulanceLocation from "../models/mongo/AmbulanceLocation.mongo.js";
import PatientCare from "../models/mongo/PatientCare.mongo.js";
import EmergencyAlert from "../models/mongo/EmergencyAlert.mongo.js";

const router = express.Router();

router.get("/api/ambulance/all", async (req, res) => {
  try {
    const locations = await AmbulanceLocation.find({}).sort({ timestamp: -1 });
    const byAmbulance = new Map();
    for (const location of locations) {
      if (!byAmbulance.has(location.ambulanceId)) {
        byAmbulance.set(location.ambulanceId, location);
      }
    }
    return res.json(Array.from(byAmbulance.values()));
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch ambulance statuses", error: error.message });
  }
});

router.get("/api/ambulance/:ambulanceId/status", async (req, res) => {
  try {
    const latest = await AmbulanceLocation.findOne({
      ambulanceId: req.params.ambulanceId,
    }).sort({ timestamp: -1 });
    return res.json(latest);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch ambulance status", error: error.message });
  }
});

router.put("/api/ambulance/:ambulanceId/location", async (req, res) => {
  try {
    const payload = {
      ...req.body,
      ambulanceId: req.params.ambulanceId,
      timestamp: new Date(),
    };
    const location = await AmbulanceLocation.create(payload);

    if (global.ambulanceNotificationService) {
      await global.ambulanceNotificationService.notifyLocationUpdate(
        req.params.ambulanceId,
        location.toJSON(),
      );
    }

    return res.json(location);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update location", error: error.message });
  }
});

router.put("/api/ambulance/:ambulanceId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const latest = await AmbulanceLocation.findOne({
      ambulanceId: req.params.ambulanceId,
    }).sort({ timestamp: -1 });

    if (latest) {
      latest.status = status;
      latest.timestamp = new Date();
      await latest.save();
      return res.json(latest);
    }

    const created = await AmbulanceLocation.create({
      ambulanceId: req.params.ambulanceId,
      latitude: req.body.latitude ?? 0,
      longitude: req.body.longitude ?? 0,
      status,
      timestamp: new Date(),
    });
    return res.json(created);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update status", error: error.message });
  }
});

router.get("/api/ambulance/:ambulanceId/active-incident", async (req, res) => {
  try {
    const activeIncident = await PatientCare.findOne({
      ambulanceId: req.params.ambulanceId,
      status: { $in: ["pending", "in-progress"] },
    }).sort({ createdAt: -1 });
    return res.json(activeIncident);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch active incident", error: error.message });
  }
});

router.post("/api/ambulance/:ambulanceId/alert", async (req, res) => {
  try {
    const alert = await EmergencyAlert.create({
      ...req.body,
      ambulanceId: req.params.ambulanceId,
    });

    if (global.ambulanceNotificationService) {
      await global.ambulanceNotificationService.notifyEmergencyAlert(alert.toJSON());
    }

    return res.status(201).json(alert);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create emergency alert", error: error.message });
  }
});

export default router;
