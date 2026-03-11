import mongoose from "mongoose";

const recipientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    role: {
      type: String,
      enum: ["dispatcher", "ambulance", "hospital", "admin", "reporter"],
      required: false,
    },
    targetType: {
      type: String,
      enum: ["ambulance", "hospital"],
      required: false,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
    acknowledged: {
      type: Boolean,
      default: false,
    },
    acknowledgedAt: {
      type: Date,
      required: false,
    },
  },
  { _id: false },
);

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["emergency", "ambulance", "hospital", "warning", "success", "info"],
    required: true,
    default: "info",
  },
  priority: {
    type: String,
    enum: ["low", "normal", "high", "critical"],
    required: true,
    default: "normal",
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  details: {
    type: String,
    default: "",
    trim: true,
  },
  recipients: {
    type: [recipientSchema],
    default: [],
  },
  relatedEmergency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Emergency",
    required: false,
  },
  relatedAmbulance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ambulance",
    required: false,
  },
  relatedHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: false,
  },
  escalatedAt: {
    type: Date,
    required: false,
  },
});

notificationSchema.index({ "recipients.userId": 1 });
notificationSchema.index({ "recipients.read": 1 });
notificationSchema.index({ "recipients.acknowledged": 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ "recipients.userId": 1, "recipients.read": 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
