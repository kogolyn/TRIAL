// controllers/alert.controller.js - Alert Controller with Integration
const IncomingAlert = require('../models/IncomingAlert.model');
const Hospital = require('../models/Hospital.model');
const { ambulanceService, notificationService } = require('./integration.controller');

/**
 * @desc    Receive incoming alert from ambulance (called by Ambulance Service)
 * @route   POST /api/er/alerts/incoming
 * @access  Public/Service
 */
exports.receiveIncomingAlert = async (req, res) => {
  try {
    const {
      ambulanceId,
      patientName,
      age,
      gender,
      condition,
      severity,
      eta,
      vitals,
      notes,
      hospitalId
    } = req.body;

    // Validation
    if (!ambulanceId || !patientName || !condition || !severity || !hospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Create alert
    const alert = await IncomingAlert.create({
      ambulanceId,
      patientName,
      age,
      gender,
      condition,
      severity,
      eta,
      vitals,
      notes,
      hospitalId,
      status: 'pending'
    });

    // TODO: Trigger WebSocket notification to frontend
    // TODO: Notify ER staff via notification service
    
    // Notify staff about incoming critical patient
    if (severity === 'critical') {
      try {
        await notificationService.notifyStaff(
          [], // Get staff IDs from hospital
          {
            type: 'critical_alert',
            title: 'Critical Patient Incoming',
            message: `${patientName} - ${condition}. ETA: ${eta} minutes`,
            data: { alertId: alert._id, severity, eta }
          }
        );
      } catch (error) {
        console.error('Failed to notify staff:', error.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Alert received successfully',
      data: {
        alertId: alert._id,
        status: alert.status
      }
    });
  } catch (error) {
    console.error('Error receiving alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error receiving alert',
      error: error.message
    });
  }
};

/**
 * @desc    Get all alerts for hospital
 * @route   GET /api/er/alerts
 * @access  Private
 */
exports.getAllAlerts = async (req, res) => {
  try {
    const { hospitalId } = req.user; // From auth middleware
    const { status, severity, limit = 50 } = req.query;

    const query = { hospitalId };
    
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const alerts = await IncomingAlert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
};

/**
 * @desc    Get single alert
 * @route   GET /api/er/alerts/:alertId
 * @access  Private
 */
exports.getAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { hospitalId } = req.user;

    const alert = await IncomingAlert.findOne({
      _id: alertId,
      hospitalId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error getting alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alert',
      error: error.message
    });
  }
};

/**
 * @desc    Acknowledge alert
 * @route   PUT /api/er/alerts/:alertId/acknowledge
 * @access  Private (ER Coordinator)
 */
exports.acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { hospitalId } = req.user;

    const alert = await IncomingAlert.findOne({
      _id: alertId,
      hospitalId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    await alert.save();

    // Send confirmation to ambulance
    try {
      await ambulanceService.sendHospitalConfirmation(
        alert.ambulanceId,
        hospitalId,
        null,
        'acknowledged'
      );
    } catch (error) {
      console.error('Failed to notify ambulance:', error.message);
    }

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged',
      data: alert
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error acknowledging alert',
      error: error.message
    });
  }
};

/**
 * @desc    Assign room to patient
 * @route   PUT /api/er/alerts/:alertId/assign-room
 * @access  Private (ER Coordinator)
 */
exports.assignRoom = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { room } = req.body;
    const { hospitalId } = req.user;

    if (!room) {
      return res.status(400).json({
        success: false,
        message: 'Room number is required'
      });
    }

    const alert = await IncomingAlert.findOne({
      _id: alertId,
      hospitalId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.roomAssigned = room;
    alert.status = 'prepared';
    await alert.save();

    // Notify ambulance of room assignment
    try {
      await ambulanceService.sendHospitalConfirmation(
        alert.ambulanceId,
        hospitalId,
        room,
        'prepared'
      );
    } catch (error) {
      console.error('Failed to notify ambulance:', error.message);
    }

    res.status(200).json({
      success: true,
      message: 'Room assigned successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error assigning room:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning room',
      error: error.message
    });
  }
};

/**
 * @desc    Notify medical team
 * @route   PUT /api/er/alerts/:alertId/notify-team
 * @access  Private (ER Coordinator)
 */
exports.notifyTeam = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { hospitalId } = req.user;

    const alert = await IncomingAlert.findOne({
      _id: alertId,
      hospitalId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.teamNotified = true;
    await alert.save();

    // Send notification to medical team
    try {
      await notificationService.notifyStaff(
        [], // Get relevant staff IDs
        {
          type: 'team_alert',
          title: 'Patient Incoming - Team Required',
          message: `${alert.patientName} - ${alert.condition}. Room: ${alert.roomAssigned || 'TBD'}. ETA: ${alert.eta} min`,
          data: { alertId: alert._id }
        }
      );
    } catch (error) {
      console.error('Failed to notify team:', error.message);
    }

    res.status(200).json({
      success: true,
      message: 'Team notified successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error notifying team:', error);
    res.status(500).json({
      success: false,
      message: 'Error notifying team',
      error: error.message
    });
  }
};

/**
 * @desc    Mark patient as arrived
 * @route   PUT /api/er/alerts/:alertId/arrived
 * @access  Private
 */
exports.markArrived = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { hospitalId } = req.user;

    const alert = await IncomingAlert.findOne({
      _id: alertId,
      hospitalId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.status = 'arrived';
    alert.arrivedAt = new Date();
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Patient marked as arrived',
      data: alert
    });
  } catch (error) {
    console.error('Error marking arrived:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

/**
 * @desc    Cancel alert
 * @route   PUT /api/er/alerts/:alertId/cancel
 * @access  Private
 */
exports.cancelAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { hospitalId } = req.user;

    const alert = await IncomingAlert.findOne({
      _id: alertId,
      hospitalId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.status = 'cancelled';
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Alert cancelled',
      data: alert
    });
  } catch (error) {
    console.error('Error cancelling alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling alert',
      error: error.message
    });
  }
};