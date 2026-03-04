import express from "express";
import PatientCare from "../models/mongo/PatientCare.mongo.js";

const router = express.Router();

router.post("/api/patient-care", async (req, res) => {
  try {
    const patientCare = await PatientCare.create(req.body);

    if (global.ambulanceNotificationService) {
      await global.ambulanceNotificationService.notifyPatientCareRecorded(
        patientCare.toJSON(),
      );
    }

    return res.status(201).json(patientCare);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create patient care record", error: error.message });
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

    if (global.ambulanceNotificationService) {
      await global.ambulanceNotificationService.notifyPatientCareRecorded(
        patientCare.toJSON(),
      );
    }

    return res.json(patientCare);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update patient care record", error: error.message });
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
