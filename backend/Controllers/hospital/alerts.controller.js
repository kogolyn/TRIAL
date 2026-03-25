import IncomingAlert from "../../models/hospital/IncomingAlert.model.js";
import { ensureAlertsSeed } from "./seed.js";

function formatAlert(a) {
  return {
    id: a._id.toString(),
    name: a.patientName,
    age: a.age,
    gender: a.gender === "Female" ? "F" : a.gender === "Male" ? "M" : "O",
    severity: a.severity,
    condition: a.condition,
    eta: a.eta,
    vitals: {
      hr: a.vitals?.heartRate ?? 0,
      bp: a.vitals?.bloodPressure ?? "-",
      spo2: a.vitals?.oxygenLevel ?? 0,
      temp: a.vitals?.temperature ?? 0,
    },
    room: a.roomAssigned || "Unassigned",
    unit: a.unit || "Ambulance Unit",
    notes: a.notes || "",
    distance: a.distance || "",
    team: a.team || "ER Team",
    status: a.status,
    ambulanceId: a.ambulanceId,
  };
}

export async function getAlerts(req, res) {
  try {
    const hospitalId = req.user.id;
    await ensureAlertsSeed(hospitalId, req.user.id);
    const rows = await IncomingAlert.find({ hospitalId, status: { $ne: "cancelled" } }).sort({ createdAt: -1 });
    res.status(200).json({ alerts: rows.map(formatAlert) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch alerts", error: error.message });
  }
}

export async function confirmRoom(req, res) {
  try {
    const { room } = req.body;
    const row = await IncomingAlert.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.id },
      { roomAssigned: room || undefined, status: "prepared" },
      { returnDocument: "after" },
    );
    if (!row) return res.status(404).json({ message: "Alert not found" });
    res.status(200).json(formatAlert(row));
  } catch (error) {
    res.status(500).json({ message: "Failed to confirm room", error: error.message });
  }
}

export async function reassignRoom(req, res) {
  try {
    const { room } = req.body;
    if (!room) return res.status(400).json({ message: "room is required" });
    const row = await IncomingAlert.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.id },
      { roomAssigned: room, status: "acknowledged" },
      { returnDocument: "after" },
    );
    if (!row) return res.status(404).json({ message: "Alert not found" });
    res.status(200).json(formatAlert(row));
  } catch (error) {
    res.status(500).json({ message: "Failed to reassign room", error: error.message });
  }
}

export async function pageTeam(req, res) {
  try {
    const row = await IncomingAlert.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.id },
      { teamNotified: true, status: "acknowledged" },
      { returnDocument: "after" },
    );
    if (!row) return res.status(404).json({ message: "Alert not found" });
    res.status(200).json(formatAlert(row));
  } catch (error) {
    res.status(500).json({ message: "Failed to page team", error: error.message });
  }
}
