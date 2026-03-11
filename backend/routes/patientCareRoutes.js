import express from "express";
import mongoose from "mongoose";
import PatientCare from "../models/ambulance/PatientCare.mongo.js";
import IncomingAlert from "../models/hospital/IncomingAlert.model.js";

const router = express.Router();

function resolveMongooseError(error, fallbackMessage) {
  if (!error) return { status: 500, message: fallbackMessage };

  if (error.name === "ValidationError") {
    const details = Object.values(error.errors || {})
      .map((err) => err.message)
      .filter(Boolean);
    return {
      status: 400,
      message: details.length > 0 ? details.join("; ") : "Validation failed.",
    };
  }

  if (error.name === "CastError") {
    return { status: 400, message: `Invalid ${error.path}` };
  }

  return { status: 500, message: error.message || fallbackMessage };
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

async function syncIncomingAlertFromPatientCare(patientCare) {
  const hospitalUserId = patientCare.hospitalUserId;
  if (!hospitalUserId || !mongoose.Types.ObjectId.isValid(hospitalUserId)) return;

  const update = {
    patientName: patientCare.patientName || "Unknown Patient",
    age: Number.isFinite(Number(patientCare.age)) ? Number(patientCare.age) : undefined,
    gender: ["Male", "Female", "Other"].includes(patientCare.gender)
      ? patientCare.gender
      : undefined,
    condition: patientCare.medicalCondition || "Emergency case",
    severity: normalizeSeverity(patientCare.severity),
    eta: parseEtaMinutes(patientCare.estimatedTime),
    unit: patientCare.ambulanceId || "",
    notes: patientCare.paramedicReport || "",
  };

  const existing = await IncomingAlert.findOneAndUpdate(
    {
      hospitalId: hospitalUserId,
      ambulanceId: patientCare.ambulanceId,
      status: { $ne: "cancelled" },
    },
    { $set: update },
    { sort: { createdAt: -1 }, new: true },
  );

  if (existing) return;

  await IncomingAlert.create({
    ambulanceId: patientCare.ambulanceId || "Unknown",
    hospitalId: hospitalUserId,
    patientName: update.patientName,
    age: update.age,
    gender: update.gender,
    condition: update.condition,
    severity: update.severity,
    eta: update.eta,
    unit: update.unit,
    notes: update.notes,
    distance: "",
  });
}

router.post("/api/patient-care", async (req, res) => {
  try {
    const patientCare = await PatientCare.create(req.body);
    await syncIncomingAlertFromPatientCare(patientCare.toJSON());

    if (global.ambulanceNotificationService) {
      await global.ambulanceNotificationService.notifyPatientCareRecorded(
        patientCare.toJSON(),
      );
    }

    return res.status(201).json(patientCare);
  } catch (error) {
    const resolved = resolveMongooseError(error, "Failed to create patient care record");
    return res.status(resolved.status).json({ message: resolved.message, error: error.message });
  }
});

router.get("/api/patient-care/ambulance/:ambulanceId", async (req, res) => {
  try {
    const records = await PatientCare.find({
      ambulanceId: req.params.ambulanceId,
    }).sort({ createdAt: -1 });
    return res.json(records);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch ambulance patient care", error: error.message });
  }
});

router.get("/api/patient-care/:incidentId", async (req, res) => {
  try {
    const records = await PatientCare.find({
      incidentId: req.params.incidentId,
    }).sort({ createdAt: -1 });
    return res.json(records);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch patient care records", error: error.message });
  }
});

router.put("/api/patient-care/:id", async (req, res) => {
  try {
    const patientCare = await PatientCare.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patientCare) {
      return res.status(404).json({ message: "Patient care record not found" });
    }
    await syncIncomingAlertFromPatientCare(patientCare.toJSON());

    if (global.ambulanceNotificationService) {
      await global.ambulanceNotificationService.notifyPatientCareRecorded(
        patientCare.toJSON(),
      );
    }

    return res.json(patientCare);
  } catch (error) {
    const resolved = resolveMongooseError(error, "Failed to update patient care record");
    return res.status(resolved.status).json({ message: resolved.message, error: error.message });
  }
});

router.delete("/api/patient-care/:id", async (req, res) => {
  try {
    const patientCare = await PatientCare.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true },
    );
    if (!patientCare) {
      return res.status(404).json({ message: "Patient care record not found" });
    }

    return res.json({ message: "Patient care record cancelled" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to cancel patient care record", error: error.message });
  }
});

export default router;
