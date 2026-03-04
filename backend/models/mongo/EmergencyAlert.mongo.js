import mongoose from "mongoose";

const emergencyAlertSchema = new mongoose.Schema(
  {
    ambulanceId: { type: String, required: true, index: true, trim: true, uppercase: true },
    incidentId: { type: String, index: true },
    type: { type: String, default: "medical" },
    severity: { type: String, enum: ["low", "normal", "high", "critical"], default: "high" },
    message: { type: String, required: true },
    location: { type: String },
    metadata: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false },
);

emergencyAlertSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const EmergencyAlert =
  mongoose.models.EmergencyAlert ||
  mongoose.model("EmergencyAlert", emergencyAlertSchema, "emergency_alerts");

export default EmergencyAlert;
