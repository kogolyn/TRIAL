import express from "express";
import mongoose from "mongoose";
import Facility from "../models/ambulance/Facility.mongo.js";
import Hospital from "../models/hospital.model.js";
import Registration from "../models/admin/Registration.model.js";
import IncomingAlert from "../models/hospital/IncomingAlert.model.js";

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

function parseGps(gps) {
  const raw = String(gps || "").trim();
  const match = raw.match(/-?\d+(\.\d+)?/g);
  if (match && match.length >= 2) {
    const lat = Number(match[0]);
    const lng = Number(match[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }
  return { lat: -0.3031, lng: 36.08 };
}

async function ensureFacilitiesFromAdmin() {
  const registrations = await Registration.find({ type: "hospital", status: "approved" }).lean();
  if (!registrations.length) return;

  const hospitals = await Hospital.find().select("_id name userId capacityAvailable").lean();
  const hospitalByName = new Map(hospitals.map((row) => [row.name, row]));

  for (const reg of registrations) {
    const hospitalReg = reg.hospital || {};
    const hospitalRow = hospitalByName.get(hospitalReg.facilityName);
    const { lat, lng } = parseGps(hospitalReg.gps);
    const bedsAvailable = Number(hospitalRow?.capacityAvailable ?? hospitalReg.totalBeds ?? 0) || 0;

    await Facility.findOneAndUpdate(
      { name: hospitalReg.facilityName },
      {
        name: hospitalReg.facilityName || "Hospital",
        type: hospitalReg.facilityType || "Hospital",
        hospitalUserId: hospitalRow?.userId || null,
        latitude: lat,
        longitude: lng,
        address: hospitalReg.address || hospitalReg.county || "",
        bedsAvailable,
        isActive: true,
      },
      { upsert: true, returnDocument: "after" },
    );
  }
}

router.get("/api/facilities/nearby", async (req, res) => {
  try {
    await ensureFacilitiesFromAdmin();
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
    await ensureFacilitiesFromAdmin();
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
