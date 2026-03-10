import express from "express";
import mongoose from "mongoose";

const router = express.Router();
const toObjectId = (id) => (id && mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null);

router.post("/complete", async (req, res) => {
  try {
    const { fromHospitalId, toHospitalId, toHospitalName } = req.body;

    if (!fromHospitalId || !toHospitalId) {
      return res.status(400).json({ success: false, message: "fromHospitalId and toHospitalId are required" });
    }

    const fromHospitalObjectId = toObjectId(fromHospitalId);
    const toHospitalObjectId = toObjectId(toHospitalId);
    if (!fromHospitalObjectId || !toHospitalObjectId) {
      return res.status(400).json({ success: false, message: "Invalid hospital ids" });
    }

    const transfer = {
      toHospital: {
        _id: toHospitalObjectId,
        name: toHospitalName || "Destination Hospital",
      },
      fromHospital: {
        _id: fromHospitalObjectId,
      },
    };

    if (global.notificationService) {
      await global.notificationService.notifyPatientTransferred(transfer);
    }

    return res.status(200).json({ success: true, message: "Patient transfer completed", data: transfer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
