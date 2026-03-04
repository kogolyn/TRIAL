import mongoose from "mongoose";

const ambulanceLocationSchema = new mongoose.Schema(
  {
    ambulanceId: { type: String, required: true, index: true, trim: true, uppercase: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speed: { type: Number, default: 0 },
    heading: { type: Number, min: 0, max: 360 },
    status: {
      type: String,
      enum: ["Off Duty", "Active Duty", "En Route", "At Scene", "Transporting"],
      default: "Active Duty",
    },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false },
);

ambulanceLocationSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const AmbulanceLocation =
  mongoose.models.AmbulanceLocation ||
  mongoose.model("AmbulanceLocation", ambulanceLocationSchema, "ambulance_locations");

export default AmbulanceLocation;
