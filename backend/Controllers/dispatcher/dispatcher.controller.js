
import mongoose from "mongoose";
import Ambulance from "../../models/dispatcher/Ambulance.model.js";
import Incident from "../../models/dispatcher/Incident.model.js";
import HospitalProfile from "../../models/dispatcher/HospitalProfile.model.js";
import IncomingAlert from "../../models/hospital/IncomingAlert.model.js";
import Hospital from "../../models/hospital.model.js";
import User from "../../models/user.model.js";
import { emitDispatcherEvent } from "../../realtime/socket.js";

const ACTIVE_STATUSES = ["pending", "assigned", "en_route", "arrived", "transporting"];
const INC_CLOSE_STATUSES = ["completed", "cancelled"];
const INCIDENT_STATUSES = [...ACTIVE_STATUSES, ...INC_CLOSE_STATUSES];
const PRIORITIES = ["low", "normal", "high", "critical"];

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function toUiStatus(value) {
  if (!value) return "Pending";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toUiSeverity(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Moderate";
}

function severityToPriority(severity = "") {
  if (severity === "critical") return "critical";
  if (severity === "urgent") return "high";
  if (severity === "minor") return "low";
  return "normal";
}

function normalizeIncomingSeverity(severity) {
  if (severity === "critical" || severity === "urgent" || severity === "moderate") return severity;
  return "moderate";
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}

function etaMinutes(distanceKm, speedKph = 40) {
  if (!Number.isFinite(distanceKm)) return null;
  const speed = Math.max(5, Number(speedKph) || 40);
  return Math.max(1, Math.round((distanceKm / speed) * 60));
}

function sanitizeServices(services = []) {
  const arr = Array.isArray(services) ? services : String(services || "").split(",");
  return Array.from(
    new Set(
      arr
        .map((s) => String(s).trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

function actorFromReq(req) {
  return {
    actorId: req.user?.id || "",
    actorName: req.user?.name || "System",
    actorRole: req.user?.role || "system",
  };
}

function parseCsvQuery(input) {
  if (!input) return [];
  return String(input)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatIncident(incident) {
  return {
    id: incident.incidentCode,
    recordId: incident._id.toString(),
    location: incident.location?.address || `${incident.location?.lat || 0}, ${incident.location?.lng || 0}`,
    position: [incident.location?.lat || 0, incident.location?.lng || 0],
    severity: toUiSeverity(incident.severity),
    priority: incident.priority || severityToPriority(incident.severity),
    status: toUiStatus(incident.status),
    isVerified: Boolean(incident.isVerified),
    condition: incident.condition,
    description: incident.description,
    reporterName: incident.reporterName,
    reporterPhone: incident.reporterPhone,
    victimReport: incident.victimReport || null,
    assignedAmbulance: incident.assignedAmbulance
      ? {
          id: incident.assignedAmbulance._id?.toString?.() || incident.assignedAmbulance.toString(),
          unitCode: incident.assignedAmbulance.unitCode,
          name: incident.assignedAmbulance.name,
          status: incident.assignedAmbulance.status,
        }
      : null,
    destinationHospital: incident.destinationHospital || null,
    notifiedHospital: incident.notifiedHospital || null,
    responseMetrics: incident.responseMetrics || {},
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt,
  };
}

function formatAmbulance(ambulance, opts = {}) {
  const payload = {
    id: ambulance._id.toString(),
    unitCode: ambulance.unitCode,
    name: ambulance.name,
    status: ambulance.status,
    crewCount: ambulance.crewCount,
    location: ambulance.location,
    telemetry: ambulance.telemetry || {},
    currentIncidentId: ambulance.currentIncident?.toString?.() || null,
  };

  if (Number.isFinite(opts.distanceKm)) {
    payload.distanceKm = Number(opts.distanceKm.toFixed(2));
    payload.etaMinutes = etaMinutes(opts.distanceKm, ambulance.telemetry?.speedKph || 40);
  }

  return payload;
}

function formatHospital(profile, distanceKm = null) {
  const payload = {
    id: profile._id.toString(),
    userId: profile.userId?.toString?.() || null,
    name: profile.name,
    contactPhone: profile.contactPhone,
    services: profile.services || [],
    totalBeds: profile.totalBeds,
    availableBeds: profile.availableBeds,
    status: profile.status,
    location: profile.location,
  };

  if (Number.isFinite(distanceKm)) {
    payload.distanceKm = Number(distanceKm.toFixed(2));
    payload.etaMinutes = etaMinutes(distanceKm, 45);
  }

  return payload;
}

function buildIncidentCode() {
  const suffix = Math.floor(Math.random() * 900 + 100);
  return `INC-${Date.now().toString().slice(-6)}${suffix}`;
}

async function emitDashboardSnapshot() {
  try {
    const [incidentsByStatus, ambulanceByStatus] = await Promise.all([
      Incident.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Ambulance.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);
    emitDispatcherEvent("dispatcher:dashboard:update", {
      incidentsByStatus,
      ambulanceByStatus,
      generatedAt: new Date(),
    });
  } catch {
    // no-op
  }
}

function appendTimeline(incident, { type, message, actorId = "", actorRole = "system", meta = {} }) {
  const event = {
    type,
    message,
    actorId,
    actorRole,
    meta,
    timestamp: new Date(),
  };

  incident.timeline = incident.timeline || [];
  incident.timeline.push(event);

  if (incident.timeline.length > 200) {
    incident.timeline = incident.timeline.slice(incident.timeline.length - 200);
  }
}

function setGeoFromLatLng(doc, lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
  doc.geo = {
    type: "Point",
    coordinates: [lng, lat],
  };
}

function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit || "20", 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

async function resolveHospitalRecord(profile) {
  if (!profile) return null;

  if (profile.userId) {
    let row = await Hospital.findOne({ userId: profile.userId });
    if (!row) {
      row = await Hospital.create({
        name: profile.name,
        contactPhone: profile.contactPhone || "",
        userId: profile.userId,
      });
    }
    return row;
  }

  let row = await Hospital.findOne({ name: profile.name });
  if (!row) {
    row = await Hospital.create({
      name: profile.name,
      contactPhone: profile.contactPhone || "",
    });
  }
  return row;
}

async function upsertIncomingAlert({ incident, hospitalRecord, message = "" }) {
  if (!incident || !hospitalRecord) return null;

  const ambulance = incident.assignedAmbulance || null;
  const eta =
    incident.destinationHospital?.etaMinutes ??
    incident.responseMetrics?.dispatchEtaMinutes ??
    null;
  const safeEta = Number.isFinite(Number(eta)) && Number(eta) > 0 ? Math.round(Number(eta)) : 10;
  const distanceKm = incident.destinationHospital?.distanceKm;

  const targetHospitalId = hospitalRecord.userId || hospitalRecord._id;
  const payload = {
    hospitalId: targetHospitalId,
    ambulanceId:
      ambulance?.unitCode ||
      ambulance?._id?.toString?.() ||
      incident.assignedAmbulance?.toString?.() ||
      "UNASSIGNED",
    patientName: incident.victimReport?.emergencyType
      ? `${incident.victimReport.emergencyType} Patient`
      : "Unknown Patient",
    condition: incident.condition || "Unknown condition",
    severity: normalizeIncomingSeverity(incident.severity),
    eta: safeEta,
    unit: ambulance?.unitCode || ambulance?.name || "Ambulance Unit",
    distance: Number.isFinite(distanceKm) ? `${Number(distanceKm).toFixed(1)} km` : "",
    notes: message || incident.description || "",
    sourceIncidentId: incident._id,
  };

  return IncomingAlert.findOneAndUpdate(
    { hospitalId: targetHospitalId, sourceIncidentId: incident._id },
    { $set: payload },
    { upsert: true, returnDocument: "after" },
  );
}

export async function createIncidentReport(req, res) {
  try {
    const { reporterName, reporterPhone, description, condition, severity, priority, location } = req.body;
    const lat = Number(location?.lat);
    const lng = Number(location?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ message: "location.lat and location.lng are required numbers" });
    }

    const resolvedSeverity = ["critical", "urgent", "moderate", "minor"].includes(severity) ? severity : "moderate";
    const resolvedPriority = PRIORITIES.includes(priority) ? priority : severityToPriority(resolvedSeverity);

    const incident = await Incident.create({
      incidentCode: buildIncidentCode(),
      reporterName: reporterName || "Anonymous Reporter",
      reporterPhone: reporterPhone || "",
      description: description || "",
      condition: condition || "Unknown condition",
      severity: resolvedSeverity,
      priority: resolvedPriority,
      location: {
        lat,
        lng,
        address: location?.address || "Unknown location",
      },
      geo: {
        type: "Point",
        coordinates: [lng, lat],
      },
      timeline: [
        {
          type: "reported",
          message: "Emergency report created",
          actorId: "",
          actorRole: "reporter",
          timestamp: new Date(),
          meta: { severity: resolvedSeverity, priority: resolvedPriority },
        },
      ],
    });

    const payload = formatIncident(incident);
    emitDispatcherEvent("dispatcher:emergency:new", payload);
    emitDashboardSnapshot();
    res.status(201).json(payload);
  } catch (error) {
    res.status(500).json({ message: "Failed to create incident report", error: error.message });
  }
}

export async function getIncidents(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};

    const statuses = parseCsvQuery(req.query.status).filter((s) => INCIDENT_STATUSES.includes(s));
    if (statuses.length) query.status = { $in: statuses };
    if (!statuses.length && req.query.active !== "false") query.status = { $in: ACTIVE_STATUSES };

    const priorities = parseCsvQuery(req.query.priority).filter((p) => PRIORITIES.includes(p));
    if (priorities.length) query.priority = { $in: priorities };

    if (req.query.verified === "true") query.isVerified = true;
    if (req.query.verified === "false") query.isVerified = false;

    if (req.query.search) {
      const regex = new RegExp(String(req.query.search).trim(), "i");
      query.$or = [
        { incidentCode: regex },
        { reporterName: regex },
        { "location.address": regex },
        { condition: regex },
      ];
    }

    const [total, rows] = await Promise.all([
      Incident.countDocuments(query),
      Incident.find(query)
        .populate("assignedAmbulance")
        .populate("destinationHospital.hospitalProfileId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.status(200).json({
      incidents: rows.map(formatIncident),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch incidents", error: error.message });
  }
}

export async function verifyEmergency(req, res) {
  try {
    const incident = await Incident.findById(req.params.id).populate("assignedAmbulance");
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    const verified = req.body?.verified !== false;
    const actor = actorFromReq(req);
    const note = String(req.body?.note || "").trim();

    incident.isVerified = verified;
    incident.verifiedAt = verified ? new Date() : null;
    incident.verifiedBy = verified ? actor.actorId : "";

    appendTimeline(incident, {
      type: verified ? "verified" : "verification_reverted",
      message: verified ? "Emergency verified by dispatcher" : "Emergency verification reverted",
      actorId: actor.actorId,
      actorRole: actor.actorRole,
      meta: note ? { note } : {},
    });

    if (note) {
      incident.notes.push({
        authorId: actor.actorId,
        authorName: actor.actorName,
        note,
        createdAt: new Date(),
      });
    }

    await incident.save();
    const payload = formatIncident(incident);
    emitDispatcherEvent("dispatcher:emergency:verified", payload);
    emitDashboardSnapshot();
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: "Failed to verify emergency", error: error.message });
  }
}

export async function updateEmergencyPriority(req, res) {
  try {
    const { priority, reason } = req.body;
    if (!PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: `priority must be one of: ${PRIORITIES.join(", ")}` });
    }

    const incident = await Incident.findById(req.params.id).populate("assignedAmbulance");
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    const actor = actorFromReq(req);
    const previous = incident.priority || severityToPriority(incident.severity);
    incident.priority = priority;

    appendTimeline(incident, {
      type: "priority_changed",
      message: `Priority updated from ${previous} to ${priority}`,
      actorId: actor.actorId,
      actorRole: actor.actorRole,
      meta: reason ? { reason } : {},
    });

    await incident.save();
    const payload = formatIncident(incident);
    emitDispatcherEvent("dispatcher:emergency:priority", payload);
    emitDashboardSnapshot();
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: "Failed to update emergency priority", error: error.message });
  }
}

export async function addEmergencyNote(req, res) {
  try {
    const note = String(req.body?.note || "").trim();
    if (!note) return res.status(400).json({ message: "note is required" });

    const incident = await Incident.findById(req.params.id).populate("assignedAmbulance");
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    const actor = actorFromReq(req);
    incident.notes.push({
      authorId: actor.actorId,
      authorName: actor.actorName,
      note,
      createdAt: new Date(),
    });

    appendTimeline(incident, {
      type: "note_added",
      message: "Dispatcher note added",
      actorId: actor.actorId,
      actorRole: actor.actorRole,
      meta: { note },
    });

    await incident.save();
    const payload = formatIncident(incident);
    emitDispatcherEvent("dispatcher:emergency:note", payload, `incident:${incident._id.toString()}`);
    res.status(201).json(payload);
  } catch (error) {
    res.status(500).json({ message: "Failed to add emergency note", error: error.message });
  }
}

export async function cancelEmergency(req, res) {
  try {
    const reason = String(req.body?.reason || "").trim();
    if (!reason) return res.status(400).json({ message: "reason is required" });

    const incident = await Incident.findById(req.params.id).populate("assignedAmbulance");
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    if (INC_CLOSE_STATUSES.includes(incident.status)) {
      return res.status(400).json({ message: "Incident is already closed" });
    }

    const actor = actorFromReq(req);
    incident.status = "cancelled";
    incident.cancelledReason = reason;
    incident.completedAt = new Date();

    if (incident.createdAt) {
      incident.responseMetrics = incident.responseMetrics || {};
      incident.responseMetrics.totalResolutionSeconds = Math.floor((Date.now() - incident.createdAt.getTime()) / 1000);
    }

    appendTimeline(incident, {
      type: "cancelled",
      message: "Emergency cancelled",
      actorId: actor.actorId,
      actorRole: actor.actorRole,
      meta: { reason },
    });

    if (incident.assignedAmbulance?._id) {
      await Ambulance.findByIdAndUpdate(incident.assignedAmbulance._id, {
        status: "available",
        currentIncident: null,
        dispatchedAt: null,
      });
    }

    await incident.save();
    const payload = formatIncident(incident);
    emitDispatcherEvent("dispatcher:emergency:status", payload);
    emitDashboardSnapshot();
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel emergency", error: error.message });
  }
}

export async function getEmergencyTimeline(req, res) {
  try {
    const incident = await Incident.findById(req.params.id).select("incidentCode timeline notes createdAt updatedAt");
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    const timeline = [...(incident.timeline || [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    res.status(200).json({
      id: incident.incidentCode,
      recordId: incident._id.toString(),
      timeline,
      notes: incident.notes || [],
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch emergency timeline", error: error.message });
  }
}

export async function createAmbulance(req, res) {
  try {
    const { unitCode, name, crewCount, location } = req.body;
    if (!unitCode || !name) {
      return res.status(400).json({ message: "unitCode and name are required" });
    }

    const exists = await Ambulance.findOne({ unitCode });
    if (exists) return res.status(400).json({ message: "Ambulance with that unitCode already exists" });

    const lat = Number(location?.lat);
    const lng = Number(location?.lng);
    const safeLat = Number.isFinite(lat) ? lat : -0.3031;
    const safeLng = Number.isFinite(lng) ? lng : 36.08;

    const row = await Ambulance.create({
      unitCode,
      name,
      crewCount: crewCount || 2,
      location: {
        lat: safeLat,
        lng: safeLng,
        address: location?.address || "Nakuru",
      },
      geo: {
        type: "Point",
        coordinates: [safeLng, safeLat],
      },
    });

    res.status(201).json(formatAmbulance(row));
  } catch (error) {
    res.status(500).json({ message: "Failed to create ambulance", error: error.message });
  }
}

export async function getAmbulances(req, res) {
  try {
    const query = {};
    const statuses = parseCsvQuery(req.query.status);
    if (statuses.length) query.status = { $in: statuses };

    const rows = await Ambulance.find(query).sort({ unitCode: 1 });

    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const withDistance = Number.isFinite(lat) && Number.isFinite(lng);

    let payload = rows.map((row) => {
      if (!withDistance) return formatAmbulance(row);
      const distanceKm = haversineKm(lat, lng, row.location?.lat || 0, row.location?.lng || 0);
      return formatAmbulance(row, { distanceKm });
    });

    if (withDistance) {
      payload = payload.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    res.status(200).json({ ambulances: payload });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch ambulances", error: error.message });
  }
}

export async function getNearbyAmbulances(req, res) {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Math.max(1, Number(req.query.radiusKm) || 20);
    const includeBusy = req.query.includeBusy === "true";
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ message: "lat and lng query parameters are required numbers" });
    }

    const statusFilter = includeBusy ? { $in: ["available", "en_route", "busy"] } : "available";
    let rows = [];

    try {
      rows = await Ambulance.find({
        status: statusFilter,
        geo: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: radiusKm * 1000,
          },
        },
      }).limit(limit);
    } catch {
      const fallback = await Ambulance.find({ status: statusFilter }).limit(200);
      rows = fallback
        .map((row) => ({
          row,
          distanceKm: haversineKm(lat, lng, row.location?.lat || 0, row.location?.lng || 0),
        }))
        .filter((item) => item.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, limit)
        .map((item) => item.row);
    }

    const payload = rows.map((row) => {
      const distanceKm = haversineKm(lat, lng, row.location?.lat || 0, row.location?.lng || 0);
      return formatAmbulance(row, { distanceKm });
    });

    res.status(200).json({ ambulances: payload, radiusKm });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch nearby ambulances", error: error.message });
  }
}

async function assignAmbulanceCore(req, res, { isReassignment = false } = {}) {
  const { ambulanceId } = req.body;
  if (!ambulanceId || !isObjectId(ambulanceId)) {
    return res.status(400).json({ message: "Valid ambulanceId is required" });
  }

  const [incident, ambulance] = await Promise.all([
    Incident.findById(req.params.id).populate("assignedAmbulance"),
    Ambulance.findById(ambulanceId),
  ]);

  if (!incident) return res.status(404).json({ message: "Incident not found" });
  if (!ambulance) return res.status(404).json({ message: "Ambulance not found" });
  if (INC_CLOSE_STATUSES.includes(incident.status)) {
    return res.status(400).json({ message: "Cannot assign ambulance to a closed incident" });
  }

  const actor = actorFromReq(req);
  const previousAmbulanceId = incident.assignedAmbulance?._id?.toString?.() || null;

  if (!isReassignment && previousAmbulanceId && previousAmbulanceId !== ambulance._id.toString()) {
    return res.status(400).json({ message: "Incident already has an assigned ambulance. Use reassign endpoint." });
  }

  if (ambulance.status !== "available" && String(ambulance.currentIncident || "") !== incident._id.toString()) {
    return res.status(400).json({ message: "Ambulance is not currently available" });
  }

  if (previousAmbulanceId && previousAmbulanceId !== ambulance._id.toString()) {
    await Ambulance.findByIdAndUpdate(previousAmbulanceId, {
      status: "available",
      currentIncident: null,
      dispatchedAt: null,
    });
  }

  const distanceKm = haversineKm(
    ambulance.location?.lat || 0,
    ambulance.location?.lng || 0,
    incident.location?.lat || 0,
    incident.location?.lng || 0,
  );
  const dispatchEtaMinutes = etaMinutes(distanceKm, ambulance.telemetry?.speedKph || 40);

  incident.assignedAmbulance = ambulance._id;
  incident.status = "assigned";
  incident.assignedAt = new Date();
  incident.responseMetrics = incident.responseMetrics || {};
  incident.responseMetrics.dispatchDistanceKm = Number(distanceKm.toFixed(2));
  incident.responseMetrics.dispatchEtaMinutes = dispatchEtaMinutes;
  incident.responseMetrics.timeToAssignSeconds = Math.floor((Date.now() - incident.createdAt.getTime()) / 1000);

  appendTimeline(incident, {
    type: isReassignment ? "ambulance_reassigned" : "ambulance_assigned",
    message: `${isReassignment ? "Ambulance reassigned" : "Ambulance assigned"} to ${ambulance.unitCode}`,
    actorId: actor.actorId,
    actorRole: actor.actorRole,
    meta: {
      ambulanceId: ambulance._id.toString(),
      unitCode: ambulance.unitCode,
      distanceKm: Number(distanceKm.toFixed(2)),
      etaMinutes: dispatchEtaMinutes,
    },
  });

  ambulance.status = "en_route";
  ambulance.currentIncident = incident._id;
  ambulance.dispatchedAt = new Date();

  await Promise.all([incident.save(), ambulance.save()]);

  const updated = await Incident.findById(incident._id).populate("assignedAmbulance");
  const payload = formatIncident(updated);
  emitDispatcherEvent("dispatcher:emergency:status", payload);
  emitDashboardSnapshot();
  return res.status(200).json(payload);
}

export async function assignAmbulance(req, res) {
  try {
    return await assignAmbulanceCore(req, res, { isReassignment: false });
  } catch (error) {
    return res.status(500).json({ message: "Failed to assign ambulance", error: error.message });
  }
}

export async function reassignAmbulance(req, res) {
  try {
    return await assignAmbulanceCore(req, res, { isReassignment: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reassign ambulance", error: error.message });
  }
}

export async function updateAmbulanceLocation(req, res) {
  try {
    const { lat, lng, address, speedKph, heading, status } = req.body;
    const ambulance = await Ambulance.findById(req.params.id);
    if (!ambulance) return res.status(404).json({ message: "Ambulance not found" });

    const nLat = Number(lat);
    const nLng = Number(lng);
    if (!Number.isFinite(nLat) || !Number.isFinite(nLng)) {
      return res.status(400).json({ message: "lat and lng are required numbers" });
    }

    ambulance.location.lat = nLat;
    ambulance.location.lng = nLng;
    if (address) ambulance.location.address = address;
    setGeoFromLatLng(ambulance, nLat, nLng);

    ambulance.telemetry = ambulance.telemetry || {};
    if (Number.isFinite(Number(speedKph))) ambulance.telemetry.speedKph = Number(speedKph);
    if (Number.isFinite(Number(heading))) ambulance.telemetry.heading = Number(heading);
    ambulance.telemetry.lastPingAt = new Date();

    if (status && ["available", "en_route", "busy", "offline", "maintenance"].includes(status)) {
      ambulance.status = status;
    }

    await ambulance.save();
    const payload = formatAmbulance(ambulance);

    emitDispatcherEvent("dispatcher:ambulance:location", payload);

    if (ambulance.currentIncident) {
      const incident = await Incident.findById(ambulance.currentIncident);
      if (incident) {
        incident.lastKnownAmbulanceLocation = {
          lat: nLat,
          lng: nLng,
          address: address || ambulance.location.address || "",
          speedKph: ambulance.telemetry.speedKph || 0,
          heading: ambulance.telemetry.heading || 0,
          updatedAt: new Date(),
        };
        await incident.save();
        emitDispatcherEvent("dispatcher:ambulance:location", payload, `incident:${incident._id.toString()}`);
      }
    }

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: "Failed to update ambulance location", error: error.message });
  }
}

export async function updateIncidentStatus(req, res) {
  try {
    const { status, location } = req.body;
    if (!INCIDENT_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${INCIDENT_STATUSES.join(", ")}` });
    }

    const incident = await Incident.findById(req.params.id).populate("assignedAmbulance");
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    if (INC_CLOSE_STATUSES.includes(incident.status)) {
      return res.status(400).json({ message: "Cannot update closed incident" });
    }

    const actor = actorFromReq(req);
    incident.status = status;

    if (status === "en_route") incident.enRouteAt = new Date();
    if (status === "arrived") {
      incident.arrivedAt = new Date();
      if (incident.assignedAt) {
        incident.responseMetrics = incident.responseMetrics || {};
        incident.responseMetrics.timeToArriveSeconds = Math.floor(
          (incident.arrivedAt.getTime() - incident.assignedAt.getTime()) / 1000,
        );
      }
    }
    if (INC_CLOSE_STATUSES.includes(status)) {
      incident.completedAt = new Date();
      if (incident.createdAt) {
        incident.responseMetrics = incident.responseMetrics || {};
        incident.responseMetrics.totalResolutionSeconds = Math.floor(
          (incident.completedAt.getTime() - incident.createdAt.getTime()) / 1000,
        );
      }
    }

    if (Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng))) {
      const lat = Number(location.lat);
      const lng = Number(location.lng);
      incident.location.lat = lat;
      incident.location.lng = lng;
      if (location?.address) incident.location.address = location.address;
      setGeoFromLatLng(incident, lat, lng);
    }

    appendTimeline(incident, {
      type: "status_updated",
      message: `Emergency status updated to ${status}`,
      actorId: actor.actorId,
      actorRole: actor.actorRole,
      meta: { status },
    });

    await incident.save();

    if (INC_CLOSE_STATUSES.includes(status) && incident.assignedAmbulance?._id) {
      await Ambulance.findByIdAndUpdate(incident.assignedAmbulance._id, {
        status: "available",
        currentIncident: null,
        dispatchedAt: null,
      });
    }

    const updated = await Incident.findById(incident._id).populate("assignedAmbulance");
    const payload = formatIncident(updated);
    emitDispatcherEvent("dispatcher:emergency:status", payload);
    emitDashboardSnapshot();
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: "Failed to update incident status", error: error.message });
  }
}

export async function calculateIncidentEta(req, res) {
  try {
    const incident = await Incident.findById(req.params.id).populate("assignedAmbulance");
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    let ambulance = incident.assignedAmbulance;
    if (req.query.ambulanceId) {
      if (!isObjectId(req.query.ambulanceId)) return res.status(400).json({ message: "Invalid ambulanceId" });
      ambulance = await Ambulance.findById(req.query.ambulanceId);
    }
    if (!ambulance) return res.status(404).json({ message: "No ambulance found for ETA calculation" });

    const toSceneKm = haversineKm(
      ambulance.location?.lat || 0,
      ambulance.location?.lng || 0,
      incident.location?.lat || 0,
      incident.location?.lng || 0,
    );
    const toSceneMinutes = etaMinutes(toSceneKm, ambulance.telemetry?.speedKph || 40);

    let toHospitalKm = null;
    let toHospitalMinutes = null;
    if (incident.destinationHospital?.hospitalProfileId && isObjectId(incident.destinationHospital.hospitalProfileId)) {
      const hospital = await HospitalProfile.findById(incident.destinationHospital.hospitalProfileId).lean();
      if (hospital) {
        toHospitalKm = haversineKm(
          incident.location?.lat || 0,
          incident.location?.lng || 0,
          hospital.location?.lat || 0,
          hospital.location?.lng || 0,
        );
        toHospitalMinutes = etaMinutes(toHospitalKm, 45);
      }
    }

    res.status(200).json({
      incidentId: incident._id.toString(),
      ambulanceId: ambulance._id.toString(),
      distanceToSceneKm: Number(toSceneKm.toFixed(2)),
      etaToSceneMinutes: toSceneMinutes,
      distanceToHospitalKm: Number.isFinite(toHospitalKm) ? Number(toHospitalKm.toFixed(2)) : null,
      etaToHospitalMinutes: toHospitalMinutes,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to calculate ETA", error: error.message });
  }
}

export async function createOrUpdateHospitalProfile(req, res) {
  try {
    const { userId, name, contactPhone, services, totalBeds, availableBeds, location, status } = req.body;
    const lat = Number(location?.lat);
    const lng = Number(location?.lng);
    if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ message: "name, location.lat and location.lng are required" });
    }

    const next = {
      name,
      contactPhone: contactPhone || "",
      services: sanitizeServices(services),
      totalBeds: Math.max(0, Number(totalBeds) || 0),
      availableBeds: Math.max(0, Number(availableBeds) || 0),
      location: {
        lat,
        lng,
        address: location?.address || "Unknown location",
      },
      geo: {
        type: "Point",
        coordinates: [lng, lat],
      },
      status:
        status && ["available", "busy", "full", "offline"].includes(status)
          ? status
          : Number(availableBeds) <= 0
            ? "full"
            : "available",
    };

    let row;
    if (userId && isObjectId(userId)) {
      row = await HospitalProfile.findOneAndUpdate(
        { userId },
        { ...next, userId },
        { upsert: true, returnDocument: "after" },
      );
    } else {
      row = await HospitalProfile.create(next);
    }

    res.status(200).json(formatHospital(row));
  } catch (error) {
    res.status(500).json({ message: "Failed to save hospital profile", error: error.message });
  }
}

export async function getHospitals(req, res) {
  try {
    const rows = await Hospital.find()
      .select("name userId capacityTotal capacityAvailable county contactPhone contactEmail")
      .sort({ name: 1 })
      .lean();

    const hospitals = rows.map((row) => ({
      id: row.userId ? row.userId.toString() : row._id.toString(),
      hospitalId: row._id.toString(),
      userId: row.userId ? row.userId.toString() : null,
      name: row.name,
      availableBeds: Number(row.capacityAvailable) || 0,
      totalBeds: Number(row.capacityTotal) || 0,
      county: row.county || "",
      contactPhone: row.contactPhone || "",
      contactEmail: row.contactEmail || "",
    }));

    res.status(200).json({ hospitals });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hospitals", error: error.message });
  }
}

export async function getNearbyHospitals(req, res) {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Math.max(1, Number(req.query.radiusKm) || 30);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const services = sanitizeServices(req.query.services);
    const minBeds = Math.max(0, Number(req.query.minBeds) || 0);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ message: "lat and lng query parameters are required numbers" });
    }

    const query = {
      availableBeds: { $gte: minBeds },
      status: { $ne: "offline" },
      ...(services.length ? { services: { $all: services } } : {}),
      geo: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      },
    };

    const rows = await HospitalProfile.find(query).limit(limit);
    const payload = rows.map((row) => {
      const distanceKm = haversineKm(lat, lng, row.location?.lat || 0, row.location?.lng || 0);
      return formatHospital(row, distanceKm);
    });

    res.status(200).json({ hospitals: payload, radiusKm });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch nearby hospitals", error: error.message });
  }
}

export async function assignDestinationHospital(req, res) {
  try {
    const { hospitalProfileId } = req.body;
    if (!hospitalProfileId || !isObjectId(hospitalProfileId)) {
      return res.status(400).json({ message: "Valid hospitalProfileId is required" });
    }

    const [incident, hospital] = await Promise.all([
      Incident.findById(req.params.id).populate("assignedAmbulance"),
      HospitalProfile.findById(hospitalProfileId),
    ]);
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    if (!hospital) return res.status(404).json({ message: "Hospital profile not found" });

    const distanceKm = haversineKm(
      incident.location?.lat || 0,
      incident.location?.lng || 0,
      hospital.location?.lat || 0,
      hospital.location?.lng || 0,
    );
    const travelEta = etaMinutes(distanceKm, 45);

    incident.destinationHospital = {
      hospitalProfileId: hospital._id,
      hospitalName: hospital.name,
      distanceKm: Number(distanceKm.toFixed(2)),
      etaMinutes: travelEta,
      assignedAt: new Date(),
    };
    incident.notifiedHospital = {
      hospitalId: hospital._id.toString(),
      hospitalName: hospital.name,
      message: "Hospital set as destination",
      notifiedAt: new Date(),
    };

    const actor = actorFromReq(req);
    appendTimeline(incident, {
      type: "destination_assigned",
      message: `Destination hospital assigned: ${hospital.name}`,
      actorId: actor.actorId,
      actorRole: actor.actorRole,
      meta: { hospitalProfileId: hospital._id.toString(), distanceKm: Number(distanceKm.toFixed(2)), travelEta },
    });

    await incident.save();

    const hospitalRecord = await resolveHospitalRecord(hospital);
    if (hospitalRecord) {
      await upsertIncomingAlert({
        incident,
        hospitalRecord,
        message: `Destination set: ${hospital.name}`,
      });

      if (global.notificationService) {
        await global.notificationService.send({
          type: "hospital",
          priority: "high",
          title: "Incoming Transfer Assigned",
          message: `Dispatcher assigned a destination hospital for incident ${incident.incidentCode}`,
          details: `Hospital: ${hospital.name}`,
          recipients: [
            hospitalRecord.userId
              ? { role: "hospital", userId: hospitalRecord.userId }
              : { role: "hospital", targetType: "hospital", targetId: hospitalRecord._id },
          ],
          relatedEmergency: incident._id,
          relatedHospital: hospitalRecord._id,
        });
      }
    }

    const payload = formatIncident(incident);
    emitDispatcherEvent("dispatcher:hospital:assigned", payload);
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: "Failed to assign destination hospital", error: error.message });
  }
}

export async function getHospitalAvailability(req, res) {
  try {
    if (!isObjectId(req.params.id)) return res.status(400).json({ message: "Invalid hospital profile id" });
    const hospital = await HospitalProfile.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital profile not found" });

    res.status(200).json({
      id: hospital._id.toString(),
      name: hospital.name,
      services: hospital.services || [],
      beds: {
        total: hospital.totalBeds,
        available: hospital.availableBeds,
        occupied: Math.max(0, hospital.totalBeds - hospital.availableBeds),
      },
      status: hospital.status,
      updatedAt: hospital.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hospital availability", error: error.message });
  }
}

export async function notifyHospital(req, res) {
  try {
    const { hospitalProfileId, hospitalId, hospitalName, message } = req.body;
    const incident = await Incident.findById(req.params.id).populate("assignedAmbulance");
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    let resolvedHospital = null;
    let resolvedHospitalRecord = null;
    if (hospitalProfileId && isObjectId(hospitalProfileId)) {
      resolvedHospital = await HospitalProfile.findById(hospitalProfileId);
    } else if (hospitalId && isObjectId(hospitalId)) {
      resolvedHospital = await HospitalProfile.findOne({ userId: hospitalId });
      if (!resolvedHospital) {
        resolvedHospitalRecord = await Hospital.findOne({ userId: hospitalId });
        if (!resolvedHospitalRecord) {
          resolvedHospitalRecord = await Hospital.findById(hospitalId);
        }
        if (!resolvedHospitalRecord) {
          const user = await User.findOne({ _id: hospitalId, role: { $in: ["hospital", "medical"] } }).lean();
          if (user) {
            incident.notifiedHospital = {
              hospitalId: user._id.toString(),
              hospitalName: user.name,
              message: message || "",
              notifiedAt: new Date(),
            };
          }
        }
      }
    }

    if (resolvedHospital) {
      incident.notifiedHospital = {
        hospitalId: resolvedHospital._id.toString(),
        hospitalName: resolvedHospital.name,
        message: message || "",
        notifiedAt: new Date(),
      };
    } else if (resolvedHospitalRecord) {
      incident.notifiedHospital = {
        hospitalId: resolvedHospitalRecord._id.toString(),
        hospitalName: resolvedHospitalRecord.name,
        message: message || "",
        notifiedAt: new Date(),
      };
    } else if (!incident.notifiedHospital?.hospitalId && !hospitalName) {
      return res.status(400).json({ message: "Provide hospitalProfileId/hospitalId/hospitalName" });
    } else if (!resolvedHospital) {
      incident.notifiedHospital = {
        hospitalId: hospitalId || "",
        hospitalName: hospitalName || "Hospital",
        message: message || "",
        notifiedAt: new Date(),
      };
    }

    const actor = actorFromReq(req);
    appendTimeline(incident, {
      type: "hospital_notified",
      message: `Hospital notified: ${incident.notifiedHospital.hospitalName}`,
      actorId: actor.actorId,
      actorRole: actor.actorRole,
      meta: { message: incident.notifiedHospital.message || "" },
    });

    await incident.save();

    let hospitalRecord = resolvedHospitalRecord;
    if (!hospitalRecord && resolvedHospital) {
      hospitalRecord = await resolveHospitalRecord(resolvedHospital);
    }

    if (hospitalRecord) {
      await upsertIncomingAlert({
        incident,
        hospitalRecord,
        message: incident.notifiedHospital?.message || "",
      });

      if (global.notificationService) {
        await global.notificationService.send({
          type: "hospital",
          priority: "high",
          title: "Hospital Notified",
          message: `Dispatcher notified ${incident.notifiedHospital?.hospitalName || "hospital"}`,
          details: incident.notifiedHospital?.message || "",
          recipients: [
            hospitalRecord.userId
              ? { role: "hospital", userId: hospitalRecord.userId }
              : { role: "hospital", targetType: "hospital", targetId: hospitalRecord._id },
          ],
          relatedEmergency: incident._id,
          relatedHospital: hospitalRecord._id,
        });
      }
    }
    const payload = formatIncident(incident);
    emitDispatcherEvent("dispatcher:hospital:notified", payload);
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: "Failed to notify hospital", error: error.message });
  }
}

export async function getMapData(req, res) {
  try {
    const [incidents, ambulances, hospitals] = await Promise.all([
      Incident.find({ status: { $in: ACTIVE_STATUSES } }).populate("assignedAmbulance").sort({ createdAt: -1 }),
      Ambulance.find({ status: { $ne: "offline" } }).sort({ updatedAt: -1 }),
      HospitalProfile.find({ status: { $ne: "offline" } }).sort({ availableBeds: -1 }).limit(200),
    ]);

    const mapIncidents = incidents.map((incident) => ({
      id: incident.incidentCode,
      recordId: incident._id.toString(),
      position: [incident.location?.lat || 0, incident.location?.lng || 0],
      title: `${incident.location?.address || "Unknown location"} - ${toUiSeverity(incident.severity)}`,
      severity: toUiSeverity(incident.severity),
      priority: incident.priority,
      status: toUiStatus(incident.status),
    }));

    const mapAmbulances = ambulances.map((ambulance) => ({
      id: ambulance._id.toString(),
      unitCode: ambulance.unitCode,
      position: [ambulance.location?.lat || 0, ambulance.location?.lng || 0],
      status: ambulance.status,
      speedKph: ambulance.telemetry?.speedKph || 0,
      currentIncidentId: ambulance.currentIncident?.toString?.() || null,
    }));

    const mapHospitals = hospitals.map((hospital) => ({
      id: hospital._id.toString(),
      name: hospital.name,
      position: [hospital.location?.lat || 0, hospital.location?.lng || 0],
      availableBeds: hospital.availableBeds,
      services: hospital.services,
      status: hospital.status,
    }));

    const center = mapIncidents[0]?.position || mapAmbulances[0]?.position || [-0.3031, 36.08];

    res.status(200).json({
      center,
      incidents: mapIncidents,
      ambulances: mapAmbulances,
      hospitals: mapHospitals,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch map data", error: error.message });
  }
}

export async function getStats(req, res) {
  try {
    const [incidentsByStatus, ambulancesByStatus] = await Promise.all([
      Incident.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Ambulance.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const incidentCounts = {
      pending: 0,
      assigned: 0,
      en_route: 0,
      arrived: 0,
      transporting: 0,
      completed: 0,
      cancelled: 0,
    };
    incidentsByStatus.forEach((row) => {
      if (Object.prototype.hasOwnProperty.call(incidentCounts, row._id)) {
        incidentCounts[row._id] = row.count;
      }
    });

    const ambulanceCounts = { available: 0, en_route: 0, busy: 0, offline: 0, maintenance: 0 };
    ambulancesByStatus.forEach((row) => {
      if (Object.prototype.hasOwnProperty.call(ambulanceCounts, row._id)) {
        ambulanceCounts[row._id] = row.count;
      }
    });

    res.status(200).json({
      incidents: incidentCounts,
      ambulances: ambulanceCounts,
      generatedAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dispatcher stats", error: error.message });
  }
}

export async function getDashboardAnalytics(req, res) {
  try {
    const [stats, completedRows, recentRows, map] = await Promise.all([
      getStatsSnapshot(),
      Incident.find({ status: "completed" })
        .select("responseMetrics createdAt completedAt")
        .sort({ completedAt: -1 })
        .limit(100)
        .lean(),
      Incident.find().select("incidentCode timeline updatedAt").sort({ updatedAt: -1 }).limit(50).lean(),
      getMapSnapshot(),
    ]);

    let avgTimeToAssign = 0;
    let avgTimeToArrive = 0;
    let avgResolution = 0;
    if (completedRows.length) {
      const assignVals = completedRows.map((r) => r.responseMetrics?.timeToAssignSeconds).filter(Number.isFinite);
      const arriveVals = completedRows.map((r) => r.responseMetrics?.timeToArriveSeconds).filter(Number.isFinite);
      const resVals = completedRows.map((r) => r.responseMetrics?.totalResolutionSeconds).filter(Number.isFinite);
      avgTimeToAssign = assignVals.length ? Math.round(assignVals.reduce((a, b) => a + b, 0) / assignVals.length) : 0;
      avgTimeToArrive = arriveVals.length ? Math.round(arriveVals.reduce((a, b) => a + b, 0) / arriveVals.length) : 0;
      avgResolution = resVals.length ? Math.round(resVals.reduce((a, b) => a + b, 0) / resVals.length) : 0;
    }

    const recentActivity = [];
    recentRows.forEach((incident) => {
      const timeline = [...(incident.timeline || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      if (timeline[0]) {
        recentActivity.push({
          incidentCode: incident.incidentCode,
          type: timeline[0].type,
          message: timeline[0].message,
          actorRole: timeline[0].actorRole,
          timestamp: timeline[0].timestamp,
        });
      }
    });

    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      statistics: stats,
      responseMetrics: {
        avgTimeToAssignSeconds: avgTimeToAssign,
        avgTimeToArriveSeconds: avgTimeToArrive,
        avgResolutionSeconds: avgResolution,
      },
      recentActivity: recentActivity.slice(0, 25),
      map,
      generatedAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard analytics", error: error.message });
  }
}

async function getStatsSnapshot() {
  const [incidentsByStatus, ambulancesByStatus] = await Promise.all([
    Incident.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Ambulance.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  return { incidentsByStatus, ambulancesByStatus };
}

async function getMapSnapshot() {
  const [incidents, ambulances, hospitals] = await Promise.all([
    Incident.find({ status: { $in: ACTIVE_STATUSES } })
      .select("incidentCode location severity priority status")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean(),
    Ambulance.find({ status: { $ne: "offline" } })
      .select("unitCode location status telemetry")
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean(),
    HospitalProfile.find({ status: { $ne: "offline" } })
      .select("name location availableBeds status services")
      .sort({ availableBeds: -1 })
      .limit(200)
      .lean(),
  ]);

  return {
    incidents: incidents.map((row) => ({
      id: row.incidentCode,
      position: [row.location?.lat || 0, row.location?.lng || 0],
      severity: row.severity,
      priority: row.priority,
      status: row.status,
    })),
    ambulances: ambulances.map((row) => ({
      id: row._id.toString(),
      unitCode: row.unitCode,
      position: [row.location?.lat || 0, row.location?.lng || 0],
      status: row.status,
      speedKph: row.telemetry?.speedKph || 0,
    })),
    hospitals: hospitals.map((row) => ({
      id: row._id.toString(),
      name: row.name,
      position: [row.location?.lat || 0, row.location?.lng || 0],
      availableBeds: row.availableBeds,
      status: row.status,
      services: row.services || [],
    })),
  };
}
