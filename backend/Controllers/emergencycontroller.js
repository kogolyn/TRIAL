import Emergency from '../models/Landing/Emergency.js';
import Incident from '../models/dispatcher/Incident.model.js';
import { emitDispatcherEvent } from '../realtime/socket.js';

const STATUS_TO_INCIDENT = {
  Pending: 'pending',
  Dispatched: 'assigned',
  EnRoute: 'en_route',
  Arrived: 'arrived',
  Completed: 'completed',
  Cancelled: 'cancelled'
};

function buildIncidentCode() {
  const suffix = Math.floor(Math.random() * 900 + 100);
  return `INC-${Date.now().toString().slice(-6)}${suffix}`;
}

function toIncidentPriority(type = '') {
  if (type === 'Medical') return 'high';
  if (type === 'Fire') return 'critical';
  return 'normal';
}

function toIncidentSeverity(type = '') {
  if (type === 'Fire') return 'critical';
  if (type === 'Medical') return 'urgent';
  return 'moderate';
}

export const createEmergency = async (req, res) => {
  try {
    console.log('Received emergency request body:', req.body);
    const { emergencyType, subType, customSubType, location, userPhone } = req.body;
    const lat = Number(location?.latitude);
    const lng = Number(location?.longitude);
    const detail = customSubType?.trim() || subType;
    const locationNotes = location?.notes ? String(location.notes).trim() : '';

    if (!emergencyType || !subType || !location || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: emergencyType, subType, location.latitude, location.longitude'
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

    const dispatcherIncident = await Incident.create({
      incidentCode: buildIncidentCode(),
      reporterName: '',
      reporterPhone: '',
      description: detail || '',
      condition: emergencyType || 'Unknown condition',
      severity: toIncidentSeverity(emergencyType),
      priority: toIncidentPriority(emergencyType),
      status: 'pending',
      location: {
        lat,
        lng,
        address: location.address || 'Unknown location'
      },
      geo: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      timeline: [
        {
          type: 'reported',
          message: 'Emergency reported by victim from landing flow',
          actorId: '',
          actorRole: 'reporter',
          timestamp: new Date(),
          meta: { emergencyType, subType: detail, locationNotes }
        }
      ],
      victimReport: {
        emergencyType,
        emergencyDetail: detail || '',
        locationNotes,
        source: 'landing'
      }
    });

    emergency.dispatcherIncidentId = dispatcherIncident._id;
    await emergency.save();

    const alertPayload = {
      id: dispatcherIncident.incidentCode,
      recordId: dispatcherIncident._id.toString(),
      location: dispatcherIncident.location.address,
      position: [dispatcherIncident.location.lat, dispatcherIncident.location.lng],
      severity: emergencyType,
      priority: dispatcherIncident.priority,
      status: 'Pending',
      description: dispatcherIncident.description,
      condition: dispatcherIncident.condition,
      victimReport: dispatcherIncident.victimReport || null,
      source: 'victim-report',
      createdAt: dispatcherIncident.createdAt
    };

    emitDispatcherEvent('dispatcher:emergency:new', alertPayload, 'role:dispatcher');
    emitDispatcherEvent('dispatcher:dashboard:update', { generatedAt: new Date() }, 'role:dispatcher');

    res.status(201).json({
      success: true,
      message: 'Emergency created successfully',
      data: emergency,
      dispatcherAlert: {
        dispatched: true,
        incidentId: dispatcherIncident._id
      }
    });

    console.log('NEW EMERGENCY:', emergency._id);
  } catch (error) {
    console.error('Error creating emergency:', error);
    res.status(500).json({ success: false, message: 'Server error creating emergency' });
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
    console.error('Error fetching emergencies:', error);
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
    console.error('Error fetching pending emergencies:', error);
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
    console.error('Error fetching emergency by id:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateEmergency = async (req, res) => {
  try {
    const { status, assignedAmbulance, assignedHospital } = req.body;
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    if (status) emergency.status = status;
    if (assignedAmbulance !== undefined) emergency.assignedAmbulance = assignedAmbulance;
    if (assignedHospital !== undefined) emergency.assignedHospital = assignedHospital;

    await emergency.save();

    const incidentStatus = STATUS_TO_INCIDENT[emergency.status];
    if (incidentStatus && emergency.dispatcherIncidentId) {
      const incident = await Incident.findByIdAndUpdate(
        emergency.dispatcherIncidentId,
        { status: incidentStatus },
        { returnDocument: "after" }
      );

      if (incident) {
        emitDispatcherEvent(
          'dispatcher:emergency:status',
          {
            id: incident.incidentCode,
            recordId: incident._id.toString(),
            status: incidentStatus,
            source: 'victim-report'
          },
          'role:dispatcher'
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Emergency updated',
      data: emergency
    });
    console.log('Emergency updated:', emergency._id);
  } catch (error) {
    console.error('Error updating emergency:', error);
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
    console.error('Error deleting emergency:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
