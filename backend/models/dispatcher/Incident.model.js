import mongoose from "mongoose";

const incidentNoteSchema = new mongoose.Schema(
  {
    authorId: { type: String, default: "" },
    authorName: { type: String, default: "System" },
    note: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const timelineEventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    actorId: { type: String, default: "" },
    actorRole: { type: String, default: "system" },
    timestamp: { type: Date, default: Date.now },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const incidentSchema = new mongoose.Schema(
  {
    incidentCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    reporterName: {
      type: String,
      default: "Anonymous Reporter",
      trim: true,
    },
    reporterPhone: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    condition: {
      type: String,
      default: "Unknown condition",
      trim: true,
    },
    severity: {
      type: String,
      enum: ["critical", "urgent", "moderate", "minor"],
      default: "moderate",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "critical"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "en_route", "arrived", "transporting", "completed", "cancelled"],
      default: "pending",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: String,
      default: "",
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
    assignedAmbulance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ambulance",
      default: null,
    },
    destinationHospital: {
      hospitalProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HospitalProfile",
        default: null,
      },
      hospitalName: { type: String, default: "" },
      distanceKm: { type: Number, default: null },
      etaMinutes: { type: Number, default: null },
      assignedAt: { type: Date, default: null },
    },
    assignedAt: { type: Date, default: null },
    enRouteAt: { type: Date, default: null },
    arrivedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledReason: { type: String, default: "" },
    lastKnownAmbulanceLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: "" },
      speedKph: { type: Number, default: 0 },
      heading: { type: Number, default: 0 },
      updatedAt: { type: Date, default: null },
    },
    responseMetrics: {
      dispatchDistanceKm: { type: Number, default: null },
      dispatchEtaMinutes: { type: Number, default: null },
      timeToAssignSeconds: { type: Number, default: null },
      timeToArriveSeconds: { type: Number, default: null },
      totalResolutionSeconds: { type: Number, default: null },
    },
    victimReport: {
      emergencyType: { type: String, default: "" },
      emergencyDetail: { type: String, default: "" },
      locationNotes: { type: String, default: "" },
      source: { type: String, default: "" },
    },
    notes: {
      type: [incidentNoteSchema],
      default: [],
    },
    timeline: {
      type: [timelineEventSchema],
      default: [],
    },
    notifiedHospital: {
      hospitalId: { type: String, default: "" },
      hospitalName: { type: String, default: "" },
      message: { type: String, default: "" },
      notifiedAt: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

incidentSchema.index({ status: 1, createdAt: -1 });
incidentSchema.index({ priority: 1, status: 1, createdAt: -1 });
incidentSchema.index({ severity: 1, status: 1 });
incidentSchema.index({ geo: "2dsphere" });

const Incident = mongoose.model("Incident", incidentSchema);
export default Incident;
