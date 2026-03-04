import express from "express";
import Facility from "../models/mongo/Facility.mongo.js";

const router = express.Router();

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.get("/api/facilities/nearby", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius || 10);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: "lat and lng query params are required" });
    }

    const facilities = await Facility.find({ isActive: true });
    const nearby = facilities
      .map((facility) => {
        const distance = haversineKm(
          lat,
          lng,
          Number(facility.latitude),
          Number(facility.longitude),
        );
        return { ...facility.toJSON(), distanceKm: distance };
      })
      .filter((facility) => facility.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return res.json(nearby);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch nearby facilities", error: error.message });
  }
});

router.get("/api/facilities/available", async (req, res) => {
  try {
    const facilities = await Facility.find({ isActive: true }).sort({ bedsAvailable: -1 });
    return res.json(facilities.filter((f) => Number(f.bedsAvailable || 0) > 0));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch available facilities", error: error.message });
  }
});

router.get("/api/facilities/:id", async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }
    return res.json(facility);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch facility details", error: error.message });
  }
});

router.put("/api/facilities/:id/notify-arrival", async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    const { ambulanceId, eta } = req.body;

    if (global.ambulanceNotificationService) {
      await global.ambulanceNotificationService.notifyHospitalArrival(
        ambulanceId,
        facility.id,
        eta,
      );
    }

    return res.json({ message: "Hospital notified of arrival", facilityId: facility.id });
  } catch (error) {
    return res.status(500).json({ message: "Failed to notify hospital", error: error.message });
  }
});

export default router;
