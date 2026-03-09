import Referral from "../../models/hospital/Referral.model.js";

function formatReferral(ref) {
  return {
    id: ref._id.toString(),
    fromFacility: ref.fromFacility,
    toFacility: ref.toFacility,
    patient: ref.patient,
    age: ref.age,
    condition: ref.condition,
    severity: ref.severity,
    reason: ref.reason,
    transport: ref.transport,
    sendingDoctor: ref.sendingDoctor,
    ourDoctor: ref.ourDoctor,
    notes: ref.notes,
    status: ref.status,
    time: new Date(ref.createdAt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export async function getReferrals(req, res) {
  try {
    const rows = await Referral.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    const incoming = rows.filter((r) => r.direction === "incoming").map(formatReferral);
    const outgoing = rows.filter((r) => r.direction === "outgoing").map(formatReferral);
    res.status(200).json({ incoming, outgoing });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch referrals", error: error.message });
  }
}

export async function createReferral(req, res) {
  try {
    const { patient, toFacility, condition, reason, severity, transport, notes } = req.body;
    if (!patient || !toFacility || !condition || !reason) {
      return res.status(400).json({ message: "patient, toFacility, condition and reason are required" });
    }

    const row = await Referral.create({
      direction: "outgoing",
      toFacility,
      patient,
      condition,
      reason,
      severity: severity || "urgent",
      transport: transport || "Ground Ambulance",
      notes: notes || "",
      ourDoctor: req.user.name ? `Dr. ${req.user.name}` : "Hospital Doctor",
      createdBy: req.user.id,
    });

    res.status(201).json(formatReferral(row));
  } catch (error) {
    res.status(500).json({ message: "Failed to create referral", error: error.message });
  }
}

export async function acceptIncomingReferral(req, res) {
  try {
    const row = await Referral.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id, direction: "incoming" },
      { status: "accepted" },
      { new: true },
    );
    if (!row) return res.status(404).json({ message: "Referral not found" });
    res.status(200).json(formatReferral(row));
  } catch (error) {
    res.status(500).json({ message: "Failed to accept referral", error: error.message });
  }
}

export async function rejectIncomingReferral(req, res) {
  try {
    const row = await Referral.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id, direction: "incoming" },
      { status: "rejected" },
      { new: true },
    );
    if (!row) return res.status(404).json({ message: "Referral not found" });
    res.status(200).json(formatReferral(row));
  } catch (error) {
    res.status(500).json({ message: "Failed to reject referral", error: error.message });
  }
}

export async function cancelOutgoingReferral(req, res) {
  try {
    const deleted = await Referral.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
      direction: "outgoing",
      status: "pending",
    });
    if (!deleted) return res.status(404).json({ message: "Pending outgoing referral not found" });
    res.status(200).json({ id: req.params.id, message: "Referral cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel referral", error: error.message });
  }
}
