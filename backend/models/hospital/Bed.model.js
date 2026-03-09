import mongoose from "mongoose";

const bedSchema = new mongoose.Schema(
  {
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    department: {
      type: String,
      required: true,
      enum: ["Emergency Room", "ICU", "Trauma Bay", "Operating Room", "Neuro Bay", "Pediatric", "General Ward"],
    },
    bedNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance", "reserved"],
      default: "available",
    },
    patientId: { type: String, default: null },
    assignedAt: { type: Date, default: null },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

bedSchema.index({ hospitalId: 1, department: 1, bedNumber: 1 }, { unique: true });

bedSchema.pre("save", function updateLastUpdated(next) {
  this.lastUpdated = Date.now();
  next();
});

const Bed = mongoose.model("Bed", bedSchema);
export default Bed;
