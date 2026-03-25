import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Temporary Hospital schema (since existing model uses CommonJS)
const hospitalSchema = new mongoose.Schema({
  // Facility Information
  facilityName: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  facilityType: { type: String, enum: ['Public', 'Private', 'NGO', 'Faith-Based'], required: true },
  
  // Location
  county: { type: String, required: true },
  subCounty: { type: String },
  address: { type: String, required: true },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  
  // Capacity
  totalBeds: { type: Number, required: true },
  icuBeds: { type: Number, default: 0 },
  
  // Contact
  phone: { type: String, required: true },
  alternativePhone: { type: String },
  email: { type: String, required: true },
  website: { type: String },
  
  // Services
  emergencyServices: [{ type: String }],
  
  // Documents (store file paths or URLs)
  documents: {
    license: { type: String },
    certificate: { type: String },
    insurance: { type: String }
  },
  
  // Status
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  
  verified: { type: Boolean, default: false }
}, { timestamps: true });

const Hospital = mongoose.model('HospitalRegistration', hospitalSchema);

// Ambulance schema
const ambulanceSchema = new mongoose.Schema({
  // Vehicle Information
  plateNumber: { type: String, required: true, unique: true },
  vehicleModel: { type: String, required: true },
  year: { type: Number, required: true },
  
  // Operator
  operatorName: { type: String, required: true },
  operatorPhone: { type: String, required: true },
  operatorEmail: { type: String, required: true },
  organization: { type: String },
  
  // Staff
  driverName: { type: String, required: true },
  driverLicense: { type: String, required: true },
  paramedicName: { type: String },
  paramedicCertification: { type: String },
  
  // Equipment
  equipment: [{ type: String }],
  
  // Documents
  documents: {
    logbook: { type: String },
    insurance: { type: String },
    driverLicense: { type: String },
    inspection: { type: String }
  },
  
  // Status
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  
  verified: { type: Boolean, default: false }
}, { timestamps: true });

const Ambulance = mongoose.model('AmbulanceRegistration', ambulanceSchema);

// Register Hospital
router.post('/hospital', async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    
    res.status(201).json({
      success: true,
      message: 'Hospital registration submitted successfully. Pending verification.',
      data: hospital
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Register Ambulance
router.post('/ambulance', async (req, res) => {
  try {
    const ambulance = new Ambulance(req.body);
    await ambulance.save();
    
    res.status(201).json({
      success: true,
      message: 'Ambulance registration submitted successfully. Pending verification.',
      data: ambulance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all pending registrations
router.get('/pending', async (req, res) => {
  try {
    const hospitals = await Hospital.find({ verificationStatus: 'pending' });
    const ambulances = await Ambulance.find({ verificationStatus: 'pending' });
    
    res.json({
      success: true,
      data: {
        hospitals,
        ambulances,
        total: hospitals.length + ambulances.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Approve registration
router.patch('/:type/:id/approve', async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type === 'hospital' ? Hospital : Ambulance;
    
    const registration = await Model.findByIdAndUpdate(
      id,
      { verificationStatus: 'approved', verified: true },
      { returnDocument: "after" }
    );
    
    res.json({
      success: true,
      message: `${type} registration approved`,
      data: registration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Reject registration
router.patch('/:type/:id/reject', async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type === 'hospital' ? Hospital : Ambulance;
    
    const registration = await Model.findByIdAndUpdate(
      id,
      { verificationStatus: 'rejected' },
      { returnDocument: "after" }
    );
    
    res.json({
      success: true,
      message: `${type} registration rejected`,
      data: registration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
