import mongoose from "mongoose";

const dispatchMessageSchema = new mongoose.Schema(
  {
    ambulanceId: { type: String, required: true, index: true, trim: true, uppercase: true },
    sender: { type: String, required: true },
    senderRole: { type: String, enum: ["dispatcher", "hospital", "admin", "system"] },
    code: { type: String },
    message: { type: String, required: true },
    messageType: {
      type: String,
      enum: ["route-update", "alert", "info", "urgent", "normal"],
      default: "normal",
    },
    priority: { type: String, enum: ["low", "normal", "high", "critical"], default: "normal" },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false },
);

dispatchMessageSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const DispatchMessage =
  mongoose.models.DispatchMessage ||
  mongoose.model("DispatchMessage", dispatchMessageSchema, "dispatch_messages");

export default DispatchMessage;
