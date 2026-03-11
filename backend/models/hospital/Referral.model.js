import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    direction: {
      type: String,
      enum: ["incoming", "outgoing"],
      required: true,
    },
    fromFacility: {
      type: String,
      trim: true,
      default: "",
    },
    toFacility: {
      type: String,
      trim: true,
      default: "",
    },
    patient: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
      default: 0,
    },
    condition: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["critical", "urgent", "moderate"],
      default: "urgent",
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    transport: {
      type: String,
      default: "Ground Ambulance",
    },
    sendingDoctor: {
      type: String,
      default: "",
    },
    ourDoctor: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

referralSchema.index({ createdBy: 1, direction: 1, status: 1 });
referralSchema.index({ createdAt: -1 });

const Referral = mongoose.model("Referral", referralSchema);
export default Referral;
