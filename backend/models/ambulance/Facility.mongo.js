import mongoose from "mongoose";

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, default: "hospital" },
    hospitalUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
    bedsAvailable: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

facilitySchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const Facility = mongoose.models.Facility || mongoose.model("Facility", facilitySchema, "facilities");

export default Facility;
