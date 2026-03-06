import Emergency from '../models/Landing/Emergency.js';

export const createEmergency = async (req, res) => {
  try {
      console.log('📨 Received request body:', req.body);  // ← ADD THIS
    console.log('📨 Request headers:', req.headers);      // ← ADD THIS
    
    const { emergencyType, subType, customSubType, location, userPhone } = req.body;

    if (!emergencyType || !subType || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const emergency = new Emergency({
      emergencyType,
      subType,
      customSubType,
      location,
      userPhone,
      status: 'Pending'
    });

    await emergency.save();

    res.status(201).json({
      success: true,
      message: 'Emergency created successfully',
      data: emergency
    });

    console.log('🚨 NEW EMERGENCY:', emergency._id);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPendingEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getEmergencyById = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }
    res.status(200).json({ success: true, data: emergency });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateEmergency = async (req, res) => {
  try {
    const { status, assignedAmbulance, assignedHospital } = req.body;
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status, assignedAmbulance, assignedHospital },
      { new: true }
    );

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency updated',
      data: emergency
    });
    console.log('✅ Emergency updated:', emergency._id);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndDelete(req.params.id);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }
    res.status(200).json({ success: true, message: 'Emergency deleted' });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};