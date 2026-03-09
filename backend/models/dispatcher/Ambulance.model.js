import mongoose from "mongoose";

const ambulanceSchema = new mongoose.Schema(
  {
    unitCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["available", "en_route", "busy", "offline", "maintenance"],
      default: "available",
    },
    crewCount: {
      type: Number,
      min: 1,
      default: 2,
    },
    location: {
      lat: { type: Number, default: -0.3031 },
      lng: { type: Number, default: 36.08 },
      address: { type: String, default: "Nakuru" },
    },
    geo: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [36.08, -0.3031],
      },
    },
    telemetry: {
      speedKph: { type: Number, min: 0, default: 0 },
      heading: { type: Number, min: 0, max: 360, default: 0 },
      lastPingAt: { type: Date, default: null },
    },
    currentIncident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
      default: null,
    },
    dispatchedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

ambulanceSchema.index({ status: 1 });
ambulanceSchema.index({ geo: "2dsphere" });

const Ambulance = mongoose.model("Ambulance", ambulanceSchema);
export default Ambulance;
