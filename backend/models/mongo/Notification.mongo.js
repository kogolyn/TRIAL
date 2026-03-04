import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    ambulanceId: { type: String, index: true },
    hospitalId: { type: String },
    type: { type: String, required: true },
    title: { type: String },
    message: { type: String, required: true },
    priority: { type: String, enum: ["low", "normal", "high", "critical"], default: "normal" },
    payload: { type: Object, default: {} },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false },
);

notificationSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema, "notifications");

export default Notification;
