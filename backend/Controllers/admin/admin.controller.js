import mongoose from "mongoose";
import Ambulance from "../../models/dispatcher/Ambulance.model.js";
import Incident from "../../models/dispatcher/Incident.model.js";
import Hospital from "../../models/hospital.model.js";
import User from "../../models/user.model.js";
import Notification from "../../models/ambulance/Notification.mongo.js";
import Registration from "../../models/admin/Registration.model.js";
import Facility from "../../models/ambulance/Facility.mongo.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Bed from "../../models/hospital/Bed.model.js";
import Equipment from "../../models/hospital/Equipment.model.js";
import BloodBank from "../../models/hospital/BloodBank.model.js";

function monthKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function monthLabel(date) {
  return date.toLocaleString("en-US", { month: "short" });
}

function buildMonthBuckets(monthsBack = 6) {
  const now = new Date();
  const buckets = [];
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: monthKey(date), month: monthLabel(date), date });
  }
  return buckets;
}

function generateTempPassword() {
  return crypto.randomBytes(8).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
}

function parseGps(gps) {
  const raw = String(gps || "").trim();
  const match = raw.match(/-?\d+(\.\d+)?/g);
  if (match && match.length >= 2) {
    const lat = Number(match[0]);
    const lng = Number(match[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }
  return { lat: -0.3031, lng: 36.08 };
}

function formatMinutes(valueSeconds) {
  const min = Math.round((Number(valueSeconds) || 0) / 60);
  return `${min} min`;
}

export async function getAdminStats(req, res) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalEmergencies, activeAmbulances, registeredHospitals, activeUsers, resolvedToday] =
      await Promise.all([
        Incident.countDocuments(),
        Ambulance.countDocuments({ status: { $ne: "offline" } }),
        Hospital.countDocuments(),
        User.countDocuments(),
        Incident.countDocuments({ status: "completed", completedAt: { $gte: startOfDay } }),
      ]);

    const recentCompleted = await Incident.find({ status: "completed" })
      .select("responseMetrics.timeToArriveSeconds completedAt")
      .sort({ completedAt: -1 })
      .limit(200)
      .lean();

    const avgArriveSeconds = recentCompleted.length
      ? Math.round(
          recentCompleted
            .map((row) => row.responseMetrics?.timeToArriveSeconds)
            .filter(Number.isFinite)
            .reduce((sum, v) => sum + v, 0) / Math.max(1, recentCompleted.length),
        )
      : 0;

    const pendingRegistrations = await Hospital.countDocuments({ userId: null });

    res.status(200).json({
      totalEmergencies,
      activeAmbulances,
      registeredHospitals,
      avgResponseTime: formatMinutes(avgArriveSeconds || 0),
      resolvedToday,
      pendingRegistrations,
      systemUptime: `${Math.round(process.uptime() / 3600)} hrs`,
      activeUsers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAdminAnalytics(req, res) {
  try {
    const buckets = buildMonthBuckets(6);
    const start = buckets[0]?.date || new Date();

    const [incidents, completed, hospitals, ambulances, countyAgg] = await Promise.all([
      Incident.find({ createdAt: { $gte: start } })
        .select("createdAt")
        .lean(),
      Incident.find({ status: "completed", completedAt: { $gte: start } })
        .select("completedAt responseMetrics.totalResolutionSeconds")
        .lean(),
      Hospital.find({ createdAt: { $gte: start } }).select("createdAt").lean(),
      Ambulance.find({ createdAt: { $gte: start } }).select("createdAt").lean(),
      Hospital.aggregate([
        { $group: { _id: { $ifNull: ["$county", "Unknown"] }, emergencies: { $sum: 1 } } },
        { $sort: { emergencies: -1 } },
        { $limit: 8 },
      ]),
    ]);

    const monthlyMap = new Map(
      buckets.map((b) => [
        b.key,
        { month: b.month, emergencies: 0, resolved: 0, avgTime: 0 },
      ]),
    );

    incidents.forEach((row) => {
      const key = monthKey(new Date(row.createdAt));
      const item = monthlyMap.get(key);
      if (item) item.emergencies += 1;
    });

    const resolutionBuckets = new Map();
    completed.forEach((row) => {
      const key = monthKey(new Date(row.completedAt));
      const item = monthlyMap.get(key);
      if (item) item.resolved += 1;

      const sec = row.responseMetrics?.totalResolutionSeconds;
      if (Number.isFinite(sec)) {
        if (!resolutionBuckets.has(key)) resolutionBuckets.set(key, []);
        resolutionBuckets.get(key).push(sec);
      }
    });

    resolutionBuckets.forEach((vals, key) => {
      const item = monthlyMap.get(key);
      if (!item) return;
      const avgSeconds = vals.reduce((sum, v) => sum + v, 0) / Math.max(1, vals.length);
      item.avgTime = Math.max(1, Math.round(avgSeconds / 60));
    });

    const registrationBuckets = new Map(
      buckets.map((b) => [b.key, { month: b.month, hospitals: 0, ambulances: 0 }]),
    );

    hospitals.forEach((row) => {
      const key = monthKey(new Date(row.createdAt));
      const item = registrationBuckets.get(key);
      if (item) item.hospitals += 1;
    });

    ambulances.forEach((row) => {
      const key = monthKey(new Date(row.createdAt));
      const item = registrationBuckets.get(key);
      if (item) item.ambulances += 1;
    });

    res.status(200).json({
      monthlyData: Array.from(monthlyMap.values()),
      countyData: countyAgg.map((row) => ({ county: row._id || "Unknown", emergencies: row.emergencies })),
      registrationData: Array.from(registrationBuckets.values()),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAdminUsers(req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(
      users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        status: "active",
        createdAt: u.createdAt,
      })),
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAdminLogs(req, res) {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const rows = await Notification.find().sort({ timestamp: -1 }).limit(limit).lean();
    const users = await User.find().select("email _id").lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u.email]));

    const normalizeEscalated = (value) => {
      if (!value) return "";
      return String(value).replace(/^(?:\s*Escalated:\s*)+/i, "Escalated: ");
    };

    const mapped = rows.map((row) => ({
      id: row._id.toString(),
      timestamp: row.timestamp,
      level: row.priority === "critical" || row.priority === "high" ? "warning" : "info",
      category: row.type || "system",
      user: userMap.get(row.userId) || "system",
      action: normalizeEscalated(row.title || row.type || "notification"),
      ip: row.payload?.ip || "-",
      details: normalizeEscalated(row.message || ""),
    }));

    // Collapse duplicate escalations that flood the log view.
    const seen = new Set();
    const deduped = [];
    for (const item of mapped) {
      const key = `${item.category}|${item.action}|${item.details}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
      if (deduped.length >= limit) break;
    }

    res.status(200).json(deduped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAdminLiveAmbulances(req, res) {
  try {
    const rows = await Ambulance.find().sort({ updatedAt: -1 }).limit(200).lean();
    res.status(200).json(
      rows.map((row) => ({
        id: row._id.toString(),
        plate: row.unitCode,
        status: row.status,
        location: row.location?.address || "Unknown location",
        lat: row.location?.lat || 0,
        lng: row.location?.lng || 0,
        patient: "-",
        distance: "-",
        eta: "-",
        driver: "N/A",
        phone: "N/A",
      })),
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAdminHospitals(req, res) {
  try {
    const rows = await Hospital.find()
      .select("name userId contactEmail county")
      .sort({ name: 1 })
      .lean();
    res.status(200).json(
      rows.map((row) => ({
        id: row.userId ? row.userId.toString() : row._id.toString(),
        hospitalId: row._id.toString(),
        name: row.name,
        contactEmail: row.contactEmail || "",
        county: row.county || "",
      })),
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function normalizeDepartmentBeds(beds = []) {
  if (!Array.isArray(beds)) return [];
  return beds
    .map((row) => ({
      department: row.department,
      total: Math.max(0, Number(row.total) || 0),
      available: Math.max(0, Number(row.available) || 0),
    }))
    .filter((row) => row.department && row.total > 0);
}

function normalizeEquipment(list = []) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => ({
      name: item.name,
      category: item.category || "other",
      totalQuantity: Math.max(0, Number(item.totalQuantity) || 0),
      availableQuantity: Math.max(0, Number(item.availableQuantity) || 0),
    }))
    .filter((item) => item.name);
}

function normalizeBlood(list = []) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => ({
      bloodType: item.bloodType,
      unitsAvailable: Math.max(0, Number(item.unitsAvailable) || 0),
      minimumThreshold: Math.max(0, Number(item.minimumThreshold) || 0),
    }))
    .filter((item) => item.bloodType);
}

async function applyHospitalResources(hospitalId, { beds, equipment, blood } = {}) {
  if (!hospitalId) return;

  if (Array.isArray(equipment)) {
    await Equipment.deleteMany({ hospitalId });
    const equipmentDocs = normalizeEquipment(equipment).map((item) => ({
      ...item,
      hospitalId,
    }));
    if (equipmentDocs.length) await Equipment.insertMany(equipmentDocs);
  }

  if (Array.isArray(blood)) {
    await BloodBank.deleteMany({ hospitalId });
    const bloodDocs = normalizeBlood(blood).map((item) => ({
      ...item,
      hospitalId,
    }));
    if (bloodDocs.length) await BloodBank.insertMany(bloodDocs);
  }

  const bedDefs = normalizeDepartmentBeds(beds);
  if (bedDefs.length) {
    for (const def of bedDefs) {
      await Bed.deleteMany({ hospitalId, department: def.department });
      const bedDocs = [];
      for (let i = 1; i <= def.total; i += 1) {
        bedDocs.push({
          hospitalId,
          department: def.department,
          bedNumber: `${def.department.slice(0, 2).toUpperCase()}-${String(i).padStart(2, "0")}`,
          status: i <= def.available ? "available" : "occupied",
        });
      }
      if (bedDocs.length) await Bed.insertMany(bedDocs);
    }
  }
}

export async function updateHospitalResources(req, res) {
  try {
    const hospitalId = req.params.id;
    const { equipment, blood, beds } = req.body || {};

    if (!hospitalId) {
      return res.status(400).json({ error: "hospital id is required" });
    }

    await applyHospitalResources(hospitalId, { equipment, blood, beds });

    res.status(200).json({ message: "Hospital resources updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function normalizeList(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((v) => String(v).trim()).filter(Boolean);
  return String(input)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

async function ensureDefaultHospitalResources(hospitalId) {
  const [bedCount, equipmentCount, bloodCount] = await Promise.all([
    Bed.countDocuments({ hospitalId }),
    Equipment.countDocuments({ hospitalId }),
    BloodBank.countDocuments({ hospitalId }),
  ]);

  if (bedCount === 0) {
    const defs = [
      ["Emergency Room", 12, 4],
      ["ICU", 10, 2],
      ["Trauma Bay", 3, 1],
      ["Operating Room", 5, 2],
      ["Neuro Bay", 2, 1],
      ["Pediatric", 8, 5],
    ];
    const bedDocs = [];
    defs.forEach(([department, total, available]) => {
      for (let i = 1; i <= total; i += 1) {
        bedDocs.push({
          hospitalId,
          department,
          bedNumber: `${department.slice(0, 2).toUpperCase()}-${String(i).padStart(2, "0")}`,
          status: i <= available ? "available" : "occupied",
        });
      }
    });
    if (bedDocs.length) await Bed.insertMany(bedDocs);
  }

  if (equipmentCount === 0) {
    await Equipment.insertMany([
      { hospitalId, name: "Ventilators", category: "ventilator", totalQuantity: 8, availableQuantity: 3 },
      { hospitalId, name: "CT Scanner", category: "imaging", totalQuantity: 2, availableQuantity: 1 },
      { hospitalId, name: "MRI Machine", category: "imaging", totalQuantity: 1, availableQuantity: 1 },
      { hospitalId, name: "X-Ray Unit", category: "imaging", totalQuantity: 3, availableQuantity: 2 },
      { hospitalId, name: "Ultrasound", category: "diagnostic", totalQuantity: 4, availableQuantity: 3 },
      { hospitalId, name: "Defibrillator", category: "monitoring", totalQuantity: 6, availableQuantity: 4 },
      { hospitalId, name: "ECG Machine", category: "monitoring", totalQuantity: 7, availableQuantity: 5 },
      { hospitalId, name: "Infusion Pump", category: "other", totalQuantity: 15, availableQuantity: 8 },
    ]);
  }

  if (bloodCount === 0) {
    await BloodBank.insertMany([
      { hospitalId, bloodType: "O-", unitsAvailable: 3 },
      { hospitalId, bloodType: "O+", unitsAvailable: 12 },
      { hospitalId, bloodType: "A-", unitsAvailable: 6 },
      { hospitalId, bloodType: "A+", unitsAvailable: 9 },
      { hospitalId, bloodType: "B-", unitsAvailable: 4 },
      { hospitalId, bloodType: "B+", unitsAvailable: 8 },
      { hospitalId, bloodType: "AB-", unitsAvailable: 2 },
      { hospitalId, bloodType: "AB+", unitsAvailable: 7 },
    ]);
  }
}

export async function createHospitalRegistration(req, res) {
  try {
    const {
      facilityName,
      facilityType,
      licenseNumber,
      county,
      address,
      gps,
      totalBeds,
      icuBeds,
      emergencyBeds,
      contactPerson,
      contactPhone,
      contactEmail,
      services,
      resources,
    } = req.body;

    if (!facilityName) {
      return res.status(400).json({ error: "facilityName is required" });
    }

    const record = await Registration.create({
      type: "hospital",
      hospital: {
        facilityName,
        facilityType: facilityType || "",
        licenseNumber: licenseNumber || "",
        county: county || "",
        address: address || "",
        gps: gps || "",
        totalBeds: Number(totalBeds) || 0,
        icuBeds: Number(icuBeds) || 0,
        emergencyBeds: Number(emergencyBeds) || 0,
        contactPerson: contactPerson || "",
        contactPhone: contactPhone || "",
        contactEmail: contactEmail || "",
        services: normalizeList(services),
        resources: {
          beds: resources?.beds || [],
          equipment: resources?.equipment || [],
          blood: resources?.blood || [],
        },
      },
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createAmbulanceRegistration(req, res) {
  try {
    const {
      plateNumber,
      vehicleModel,
      year,
      gpsId,
      operatorName,
      operatorLicense,
      contactPhone,
      contactEmail,
      driverName,
      driverLicense,
      paramedicName,
      paramedicCert,
      equipment,
    } = req.body;

    if (!plateNumber) {
      return res.status(400).json({ error: "plateNumber is required" });
    }

    const record = await Registration.create({
      type: "ambulance",
      ambulance: {
        plateNumber,
        vehicleModel: vehicleModel || "",
        year: Number(year) || 0,
        gpsId: gpsId || "",
        operatorName: operatorName || "",
        operatorLicense: operatorLicense || "",
        contactPhone: contactPhone || "",
        contactEmail: contactEmail || "",
        driverName: driverName || "",
        driverLicense: driverLicense || "",
        paramedicName: paramedicName || "",
        paramedicCert: paramedicCert || "",
        equipment: normalizeList(equipment),
      },
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getRegistrations(req, res) {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;

    const rows = await Registration.find(query).sort({ createdAt: -1 }).lean();
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function approveRegistration(req, res) {
  try {
    const record = await Registration.findById(req.params.id);
    if (!record) return res.status(404).json({ error: "Registration not found" });
    if (record.status !== "pending") {
      return res.status(400).json({ error: "Registration already processed" });
    }

    let createdUser = null;
    let tempPassword = null;

    if (record.type === "hospital") {
      const data = record.hospital || {};
      const exists = await Hospital.findOne({ name: data.facilityName });
      let hospitalRow = exists;
      if (!hospitalRow) {
        hospitalRow = await Hospital.create({
          name: data.facilityName,
          county: data.county || "",
          capacityTotal: Number(data.totalBeds) || 0,
          capacityAvailable: Number(data.totalBeds) || 0,
          contactPhone: data.contactPhone || "",
          contactEmail: data.contactEmail || "",
        });
      } else if (data.contactEmail && !hospitalRow.contactEmail) {
        hospitalRow.contactEmail = data.contactEmail;
        await hospitalRow.save();
      }

      if (data.contactEmail) {
        const existingUser = await User.findOne({ email: data.contactEmail });
        if (!existingUser) {
          tempPassword = generateTempPassword();
          const password = await bcrypt.hash(tempPassword, 10);
          createdUser = await User.create({
            name: data.facilityName,
            email: data.contactEmail,
            role: "hospital",
            mustResetPassword: true,
            password,
          });
        } else {
          createdUser = existingUser;
        }
      }

      if (createdUser && hospitalRow && !hospitalRow.userId) {
        hospitalRow.userId = createdUser._id;
        await hospitalRow.save();
      }

      const targetHospitalId = hospitalRow?.userId || hospitalRow?._id;
      if (targetHospitalId && data.resources) {
        const hasResources =
          (Array.isArray(data.resources.beds) && data.resources.beds.length > 0) ||
          (Array.isArray(data.resources.equipment) && data.resources.equipment.length > 0) ||
          (Array.isArray(data.resources.blood) && data.resources.blood.length > 0);
        if (hasResources) {
          await applyHospitalResources(targetHospitalId, data.resources);
        }
      }

      if (hospitalRow) {
        const { lat, lng } = parseGps(data.gps);
        const bedsAvailable = Number(hospitalRow.capacityAvailable || data.totalBeds || 0) || 0;
        await Facility.findOneAndUpdate(
          {
            $or: [
              hospitalRow.userId ? { hospitalUserId: hospitalRow.userId } : null,
              { name: data.facilityName },
            ].filter(Boolean),
          },
          {
            name: data.facilityName,
            type: data.facilityType || "Hospital",
            hospitalUserId: hospitalRow.userId || null,
            latitude: lat,
            longitude: lng,
            address: data.address || "",
            bedsAvailable,
            isActive: true,
          },
          { upsert: true, returnDocument: "after" },
        );
      }
    }

    if (record.type === "ambulance") {
      const data = record.ambulance || {};
      const exists = await Ambulance.findOne({ unitCode: data.plateNumber });
      if (!exists) {
        await Ambulance.create({
          unitCode: data.plateNumber,
          name: data.operatorName || data.plateNumber,
          crewCount: 2,
          location: { lat: -0.3031, lng: 36.08, address: "Nakuru" },
          geo: { type: "Point", coordinates: [36.08, -0.3031] },
        });
      }

      if (data.contactEmail) {
        const existingUser = await User.findOne({ email: data.contactEmail });
        if (!existingUser) {
          tempPassword = generateTempPassword();
          const password = await bcrypt.hash(tempPassword, 10);
          createdUser = await User.create({
            name: data.operatorName || data.plateNumber,
            email: data.contactEmail,
            role: "ambulance",
            ambulanceId: String(data.plateNumber || "").toUpperCase(),
            mustResetPassword: true,
            password,
          });
        } else {
          createdUser = existingUser;
        }
      }
    }

    record.status = "approved";
    record.reviewedAt = new Date();
    record.reviewedBy = req.user?.id || "";
    await record.save();

    res.status(200).json({
      record,
      createdUser: createdUser
        ? {
            id: createdUser._id.toString(),
            email: createdUser.email,
            role: createdUser.role,
          }
        : null,
      tempPassword,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function rejectRegistration(req, res) {
  try {
    const record = await Registration.findById(req.params.id);
    if (!record) return res.status(404).json({ error: "Registration not found" });
    if (record.status !== "pending") {
      return res.status(400).json({ error: "Registration already processed" });
    }

    record.status = "rejected";
    record.reviewedAt = new Date();
    record.reviewedBy = req.user?.id || "";
    record.rejectionReason = String(req.body?.reason || "").trim();
    await record.save();

    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function resetUserPassword(req, res) {
  try {
    const identifier = String(req.params.id || "").trim();
    const query = mongoose.isValidObjectId(identifier)
      ? { _id: identifier }
      : { email: identifier.toLowerCase() };
    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const tempPassword = generateTempPassword();
    const password = await bcrypt.hash(tempPassword, 10);
    user.password = password;
    user.mustResetPassword = true;
    await user.save();

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      tempPassword,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
