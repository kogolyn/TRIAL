import mongoose from "mongoose";

const hospitalProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      default: "",
      trim: true,
    },
    services: {
      type: [String],
      default: [],
    },
    totalBeds: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableBeds: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["available", "busy", "full", "offline"],
      default: "available",
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: "Unknown location" },
    },
    geo: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
  },
  { timestamps: true },
);

hospitalProfileSchema.index({ geo: "2dsphere" });
hospitalProfileSchema.index({ services: 1, availableBeds: -1 });
hospitalProfileSchema.index({ userId: 1 }, { unique: true, sparse: true });

const HospitalProfile = mongoose.model("HospitalProfile", hospitalProfileSchema);
export default HospitalProfile;
