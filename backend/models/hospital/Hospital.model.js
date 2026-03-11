// models/Hospital.model.js - Hospital Model
const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  level: {
    type: String,
    enum: ['Level 1', 'Level 2', 'Level 3', 'Specialty'],
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  totalBeds: {
    type: Number,
    default: 0
  },
  availableBeds: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'full'],
    default: 'available'
  },
  verified: {
    type: Boolean,
    default: false
  },
  departments: [{
    name: String,
    totalBeds: Number,
    availableBeds: Number,
    capacityStatus: {
      type: String,
      enum: ['good', 'moderate', 'low', 'critical', 'full'],
      default: 'good'
    }
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
hospitalSchema.index({ location: '2dsphere' });

// Method to update hospital status based on bed availability
hospitalSchema.methods.updateStatus = function() {
  const occupancyRate = (this.totalBeds - this.availableBeds) / this.totalBeds;
  
  if (this.availableBeds === 0) {
    this.status = 'full';
  } else if (occupancyRate >= 0.75) {
    this.status = 'busy';
  } else {
    this.status = 'available';
  }
  
  return this.save();
};

module.exports = mongoose.model('Hospital', hospitalSchema);