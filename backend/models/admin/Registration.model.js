import mongoose from "mongoose";

const hospitalRegistrationSchema = new mongoose.Schema(
  {
    facilityName: { type: String, required: true, trim: true },
    facilityType: { type: String, default: "" },
    licenseNumber: { type: String, default: "" },
    county: { type: String, default: "" },
    address: { type: String, default: "" },
    gps: { type: String, default: "" },
    totalBeds: { type: Number, default: 0 },
    icuBeds: { type: Number, default: 0 },
    emergencyBeds: { type: Number, default: 0 },
    contactPerson: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    services: { type: [String], default: [] },
    resources: {
      beds: {
        type: [
          new mongoose.Schema(
            {
              department: { type: String, default: "" },
              total: { type: Number, default: 0 },
              available: { type: Number, default: 0 },
            },
            { _id: false },
          ),
        ],
        default: [],
      },
      equipment: {
        type: [
          new mongoose.Schema(
            {
              name: { type: String, default: "" },
              category: { type: String, default: "other" },
              totalQuantity: { type: Number, default: 0 },
              availableQuantity: { type: Number, default: 0 },
            },
            { _id: false },
          ),
        ],
        default: [],
      },
      blood: {
        type: [
          new mongoose.Schema(
            {
              bloodType: { type: String, default: "" },
              unitsAvailable: { type: Number, default: 0 },
              minimumThreshold: { type: Number, default: 0 },
            },
            { _id: false },
          ),
        ],
        default: [],
      },
    },
  },
  { _id: false },
);

const ambulanceRegistrationSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, required: true, trim: true },
    vehicleModel: { type: String, default: "" },
    year: { type: Number, default: 0 },
    gpsId: { type: String, default: "" },
    operatorName: { type: String, default: "" },
    operatorLicense: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    driverName: { type: String, default: "" },
    driverLicense: { type: String, default: "" },
    paramedicName: { type: String, default: "" },
    paramedicCert: { type: String, default: "" },
    equipment: { type: [String], default: [] },
  },
  { _id: false },
);

const registrationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["hospital", "ambulance"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    hospital: { type: hospitalRegistrationSchema, default: null },
    ambulance: { type: ambulanceRegistrationSchema, default: null },
  },
  { timestamps: true },
);

registrationSchema.index({ createdAt: -1 });

const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;
