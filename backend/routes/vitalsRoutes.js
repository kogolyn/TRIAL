import express from "express";
import mongoose from "mongoose";
import Vitals from "../models/mongo/Vitals.mongo.js";
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

async function syncIncomingAlertVitals(vitals) {
  const hospitalUserId = vitals.hospitalUserId;
  if (!hospitalUserId || !mongoose.Types.ObjectId.isValid(hospitalUserId)) return;

  const mappedVitals = {
    heartRate: Number.isFinite(Number(vitals.heartRate)) ? Number(vitals.heartRate) : undefined,
    bloodPressure: vitals.bloodPressure || undefined,
    oxygenLevel: Number.isFinite(Number(vitals.oxygenLevel)) ? Number(vitals.oxygenLevel) : undefined,
    temperature: Number.isFinite(Number(vitals.temperature)) ? Number(vitals.temperature) : undefined,
    respiratoryRate: Number.isFinite(Number(vitals.respiratoryRate))
      ? Number(vitals.respiratoryRate)
      : undefined,
  };

  await IncomingAlert.findOneAndUpdate(
    {
      hospitalId: hospitalUserId,
      ambulanceId: vitals.ambulanceId,
      status: { $ne: "cancelled" },
    },
    { $set: { vitals: mappedVitals } },
    { sort: { createdAt: -1 } },
  );
}

router.post("/api/vitals", async (req, res) => {
  try {
    console.log("Vitals payload received:", req.body);
    const vitals = await Vitals.create(req.body);
    await syncIncomingAlertVitals(vitals.toJSON());

    if (global.ambulanceNotificationService) {
      if (vitals.isCritical) {
        await global.ambulanceNotificationService.notifyVitalsCritical(vitals.toJSON());
      } else {
        await global.ambulanceNotificationService.notifyVitalsRecorded(vitals.toJSON());
      }
    }

    return res.status(201).json(vitals);
  } catch (error) {
    console.error("Vitals record failed:", error);
    const resolved = resolveMongooseError(error, "Failed to record vitals");
    return res.status(resolved.status).json({ message: resolved.message, error: error.message });
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
