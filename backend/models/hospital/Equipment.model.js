import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["ventilator", "imaging", "monitoring", "surgical", "diagnostic", "other"],
      default: "other",
    },
    totalQuantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["available", "low", "critical", "unavailable"],
      default: "available",
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

equipmentSchema.pre("save", function setEquipmentStatus(next) {
  const availabilityRate = this.totalQuantity > 0 ? this.availableQuantity / this.totalQuantity : 0;
  if (this.availableQuantity === 0) this.status = "unavailable";
  else if (availabilityRate <= 0.33) this.status = "critical";
  else if (availabilityRate <= 0.66) this.status = "low";
  else this.status = "available";
  this.lastUpdated = Date.now();
  next();
});

const Equipment = mongoose.model("Equipment", equipmentSchema);
export default Equipment;
