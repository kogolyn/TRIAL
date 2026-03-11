import mongoose from "mongoose";

const bloodBankSchema = new mongoose.Schema(
  {
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    bloodType: {
      type: String,
      enum: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
      required: true,
    },
    unitsAvailable: { type: Number, required: true, min: 0, default: 0 },
    minimumThreshold: { type: Number, default: 5 },
    status: { type: String, enum: ["ok", "low", "critical"], default: "ok" },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

bloodBankSchema.index({ hospitalId: 1, bloodType: 1 }, { unique: true });

bloodBankSchema.pre("save", function setBloodStatus(next) {
  if (this.unitsAvailable < this.minimumThreshold) this.status = "critical";
  else if (this.unitsAvailable < this.minimumThreshold * 1.5) this.status = "low";
  else this.status = "ok";
  this.lastUpdated = Date.now();
  next();
});

const BloodBank = mongoose.model("BloodBank", bloodBankSchema);
export default BloodBank;
