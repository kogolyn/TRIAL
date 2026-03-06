import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema(
  {
    emergencyType: {
      type: String,
      required: true,
      enum: ['Medical', 'Accident', 'Fire']
    },
    subType: {
      type: String,
      required: true
    },
    customSubType: {
      type: String,
      default: ''
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, required: true },
      notes: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['Pending', 'Dispatched', 'EnRoute', 'Arrived', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    assignedAmbulance: { type: String, default: null },
    assignedHospital: { type: String, default: null },
    userPhone: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Emergency', emergencySchema);