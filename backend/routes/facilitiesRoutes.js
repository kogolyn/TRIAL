import express from "express";
import mongoose from "mongoose";
import Facility from "../models/ambulance/Facility.mongo.js";
import IncomingAlert from "../models/hospital/IncomingAlert.model.js";

const router = express.Router();

const MIN_FACILITY_VARIETY = 8;

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

function parseEtaMinutes(rawEta) {
  const asNumber = Number(rawEta);
  if (!Number.isNaN(asNumber) && asNumber > 0) return Math.round(asNumber);
  const matched = String(rawEta || "").match(/\d+/);
  if (matched) return Number(matched[0]);
  return 10;
}

function normalizeSeverity(rawSeverity) {
  const value = String(rawSeverity || "").toLowerCase();
  if (value === "critical" || value === "severe") return "critical";
  if (value === "urgent") return "urgent";
  return "moderate";
}

async function ensureFacilitySeed() {
  const currentCount = await Facility.countDocuments({ isActive: true });
  if (currentCount >= MIN_FACILITY_VARIETY) return;

  const defaults = [
    { name: "Nakuru County Referral Hospital", type: "Level 5 Hospital", latitude: -0.3031, longitude: 36.0800, bedsAvailable: 12, isActive: true },
    { name: "War Memorial Hospital", type: "General Hospital", latitude: -0.2877, longitude: 36.0695, bedsAvailable: 6, isActive: true },
    { name: "Avenue Hospital Nakuru", type: "Private Hospital", latitude: -0.2795, longitude: 36.0679, bedsAvailable: 9, isActive: true },
    { name: "Kijabe Mission Hospital", type: "Specialist Hospital", latitude: -0.9686, longitude: 36.6174, bedsAvailable: 4, isActive: true },
    { name: "Molo Sub-County Hospital", type: "County Hospital", latitude: -0.2479, longitude: 35.7361, bedsAvailable: 7, isActive: true },
    { name: "Naivasha District Hospital", type: "District Hospital", latitude: -0.7167, longitude: 36.4333, bedsAvailable: 10, isActive: true },
    { name: "Gilgil Sub-County Hospital", type: "County Hospital", latitude: -0.4989, longitude: 36.3190, bedsAvailable: 5, isActive: true },
    { name: "St. Mary's Mission Hospital Gilgil", type: "Mission Hospital", latitude: -0.5041, longitude: 36.3210, bedsAvailable: 3, isActive: true },
  ];

  for (const entry of defaults) {
    const exists = await Facility.findOne({ name: entry.name });
    if (!exists) {
      await Facility.create(entry);
    }
  }
}

router.get("/api/facilities/nearby", async (req, res) => {
  try {
    await ensureFacilitySeed();
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
    await ensureFacilitySeed();
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

    const {
      ambulanceId,
      eta,
      patientName,
      age,
      gender,
      medicalCondition,
      severity,
      distanceKm,
      notes,
      hospitalUserId,
    } = req.body;

    const targetHospitalUserId = hospitalUserId || facility.hospitalUserId?.toString() || null;
    let alertCreated = false;

    if (targetHospitalUserId && mongoose.Types.ObjectId.isValid(targetHospitalUserId)) {
      await IncomingAlert.create({
        ambulanceId: ambulanceId || "Unknown",
        patientName: patientName || "Unknown Patient",
        age: Number.isFinite(Number(age)) ? Number(age) : undefined,
        gender: ["Male", "Female", "Other"].includes(gender) ? gender : undefined,
        condition: medicalCondition || "Emergency case",
        severity: normalizeSeverity(severity),
        eta: parseEtaMinutes(eta),
        unit: ambulanceId || "",
        distance: Number.isFinite(Number(distanceKm))
          ? `${Number(distanceKm).toFixed(1)} km`
          : "",
        notes: notes || "",
        hospitalId: targetHospitalUserId,
      });
      alertCreated = true;
    }

    if (global.ambulanceNotificationService) {
      await global.ambulanceNotificationService.notifyHospitalArrival(
        ambulanceId,
        facility.id,
        eta,
        targetHospitalUserId,
      );
    }

    return res.json({
      message: "Hospital notified of arrival",
      facilityId: facility.id,
      hospitalUserId: targetHospitalUserId,
      alertCreated,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to notify hospital", error: error.message });
  }
});

export default router;
