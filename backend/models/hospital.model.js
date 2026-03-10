import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    county: {
      type: String,
      trim: true,
    },
    capacityTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    capacityAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

hospitalSchema.virtual("capacityPercentage").get(function capacityPercentage() {
  if (!this.capacityTotal) {
    return 0;
  }
  const occupied = this.capacityTotal - this.capacityAvailable;
  return Math.round((occupied / this.capacityTotal) * 100);
});

const Hospital = mongoose.model("Hospital", hospitalSchema);

export default Hospital;