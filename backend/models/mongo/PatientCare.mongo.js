import mongoose from "mongoose";

const patientCareSchema = new mongoose.Schema(
  {
    ambulanceId: { type: String, required: true, index: true, trim: true, uppercase: true },
    incidentId: { type: String, required: true, index: true, trim: true },
    patientName: { type: String, required: true, trim: true },
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    medicalCondition: { type: String, required: true, trim: true },
    severity: {
      type: String,
      required: true,
      enum: ["Critical", "Severe", "Moderate", "Mild"],
      index: true,
    },
    estimatedTime: { type: String },
    paramedicReport: { type: String },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    createdBy: { type: String },
  },
  { timestamps: true, versionKey: false },
);

patientCareSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const PatientCare =
  mongoose.models.PatientCare ||
  mongoose.model("PatientCare", patientCareSchema, "patient_care");

export default PatientCare;
