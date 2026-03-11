import mongoose from "mongoose";
import { checkCriticalVitals } from "../../utils/vitalsValidator.js";

const vitalsSchema = new mongoose.Schema(
  {
    patientCareId: { type: String, index: true },
    incidentId: { type: String, index: true },
    ambulanceId: { type: String, index: true, trim: true, uppercase: true },
    facilityId: { type: String, index: true },
    hospitalUserId: { type: String, index: true },
    heartRate: { type: Number },
    bloodPressure: { type: String },
    oxygenLevel: { type: Number, min: 0, max: 100 },
    temperature: { type: Number },
    respiratoryRate: { type: Number },
    isCritical: { type: Boolean, default: false, index: true },
    recordedAt: { type: Date, default: Date.now, index: true },
    recordedBy: { type: String },
  },
  { versionKey: false },
);

vitalsSchema.pre("validate", function markCritical() {
  this.isCritical = checkCriticalVitals(this);
});

vitalsSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const Vitals = mongoose.models.Vitals || mongoose.model("Vitals", vitalsSchema, "vitals");

export default Vitals;
