import mongoose from "mongoose";

const incomingAlertSchema = new mongoose.Schema(
  {
    ambulanceId: { type: String, required: true },
    patientName: { type: String, required: true },
    age: { type: Number, min: 0, max: 150 },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    condition: { type: String, required: true },
    severity: { type: String, enum: ["critical", "urgent", "moderate"], required: true },
    eta: { type: Number, required: true },
    unit: { type: String, default: "" },
    distance: { type: String, default: "" },
    team: { type: String, default: "ER Team" },
    vitals: {
      heartRate: Number,
      bloodPressure: String,
      oxygenLevel: Number,
      temperature: Number,
      respiratoryRate: Number,
    },
    notes: { type: String, default: "" },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    roomAssigned: { type: String, default: null },
    teamNotified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "acknowledged", "prepared", "arrived", "admitted", "cancelled"],
      default: "pending",
    },
    acknowledgedAt: { type: Date, default: null },
    arrivedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

incomingAlertSchema.index({ hospitalId: 1, status: 1 });
incomingAlertSchema.index({ severity: 1, status: 1 });
incomingAlertSchema.index({ createdAt: -1 });

const IncomingAlert = mongoose.model("IncomingAlert", incomingAlertSchema);
export default IncomingAlert;
