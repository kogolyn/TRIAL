import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Ambulance from "../models/dispatcher/Ambulance.model.js";
import HospitalProfile from "../models/dispatcher/HospitalProfile.model.js";
import Incident from "../models/dispatcher/Incident.model.js";

dotenv.config();

const shouldReset = process.argv.includes("--reset");

const ambulanceSeeds = [
  { unitCode: "AMB-001", name: "Nakuru War Memorial Unit", lat: -0.2931, lng: 36.072, address: "Nakuru CBD" },
  { unitCode: "AMB-002", name: "Rift Valley PGH Unit", lat: -0.302, lng: 36.081, address: "Rift Valley PGH" },
  { unitCode: "AMB-003", name: "Nakuru Level 5 Unit", lat: -0.288, lng: 36.094, address: "Nakuru Level 5" },
  { unitCode: "AMB-004", name: "Flamboyant Medical Unit", lat: -0.315, lng: 36.064, address: "Flamboyant Medical Centre" },
  { unitCode: "AMB-005", name: "Nakuru East Unit", lat: -0.321, lng: 36.104, address: "Nakuru East Sub-County" },
];

const hospitalSeeds = [
  {
    name: "Nakuru War Memorial Hospital",
    contactPhone: "+254700111111",
    services: ["trauma", "emergency", "radiology", "surgery"],
    totalBeds: 120,
    availableBeds: 24,
    status: "available",
    lat: -0.294,
    lng: 36.073,
    address: "Nakuru CBD",
  },
  {
    name: "Rift Valley Provincial General Hospital",
    contactPhone: "+254700222222",
    services: ["trauma", "icu", "orthopedic", "surgery"],
    totalBeds: 220,
    availableBeds: 32,
    status: "busy",
    lat: -0.301,
    lng: 36.082,
    address: "Nakuru Town",
  },
  {
    name: "Nakuru Level 5 Hospital",
    contactPhone: "+254700333333",
    services: ["emergency", "surgery", "pediatrics", "blood-bank"],
    totalBeds: 300,
    availableBeds: 41,
    status: "available",
    lat: -0.287,
    lng: 36.095,
    address: "Milimani, Nakuru",
  },
  {
    name: "Flamboyant Medical Centre",
    contactPhone: "+254700444444",
    services: ["emergency", "radiology", "maternity"],
    totalBeds: 90,
    availableBeds: 11,
    status: "busy",
    lat: -0.314,
    lng: 36.065,
    address: "Kenyatta Avenue, Nakuru",
  },
];

const incidentSeeds = [
  {
    incidentCode: "INC-SEED-001",
    reporterName: "Traffic Officer Maina",
    reporterPhone: "+254711001001",
    description: "Two-car collision with one trapped passenger.",
    condition: "Major trauma",
    severity: "critical",
    priority: "critical",
    status: "pending",
    lat: -0.2831,
    lng: 36.06,
    address: "Kenyatta Avenue, CBD",
  },
  {
    incidentCode: "INC-SEED-002",
    reporterName: "Civic Volunteer Achieng",
    reporterPhone: "+254711002002",
    description: "Pedestrian hit by motorcycle. Conscious.",
    condition: "Head injury",
    severity: "urgent",
    priority: "high",
    status: "assigned",
    lat: -0.295,
    lng: 36.1,
    address: "Section 58, Near Hyrax",
  },
  {
    incidentCode: "INC-SEED-003",
    reporterName: "Resident Kamau",
    reporterPhone: "+254711003003",
    description: "Elderly patient with chest pain and dizziness.",
    condition: "Cardiac distress",
    severity: "urgent",
    priority: "high",
    status: "en_route",
    lat: -0.31,
    lng: 36.05,
    address: "Kaptembwa, West",
  },
  {
    incidentCode: "INC-SEED-004",
    reporterName: "Patrol Unit Delta",
    reporterPhone: "+254711004004",
    description: "Bicycle crash, stable but bleeding from leg.",
    condition: "Laceration",
    severity: "minor",
    priority: "low",
    status: "pending",
    lat: -0.34,
    lng: 36.01,
    address: "Njoro Road, Egerton",
  },
];

function toGeo(lat, lng) {
  return {
    type: "Point",
    coordinates: [lng, lat],
  };
}

async function seedAmbulances() {
  const rows = [];
  for (const item of ambulanceSeeds) {
    const update = {
      name: item.name,
      status: "available",
      crewCount: 2,
      location: { lat: item.lat, lng: item.lng, address: item.address },
      geo: toGeo(item.lat, item.lng),
    };

    const row = await Ambulance.findOneAndUpdate({ unitCode: item.unitCode }, update, {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
    });
    rows.push(row);
  }
  return rows;
}

async function seedHospitals() {
  const rows = [];
  for (const item of hospitalSeeds) {
    const update = {
      userId: new mongoose.Types.ObjectId(),
      name: item.name,
      contactPhone: item.contactPhone,
      services: item.services,
      totalBeds: item.totalBeds,
      availableBeds: item.availableBeds,
      status: item.status,
      location: { lat: item.lat, lng: item.lng, address: item.address },
      geo: toGeo(item.lat, item.lng),
    };

    const row = await HospitalProfile.findOneAndUpdate({ name: item.name }, update, {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
    });
    rows.push(row);
  }
  return rows;
}

async function seedIncidents(ambulances, hospitals) {
  const incidentRows = [];
  for (const item of incidentSeeds) {
    const assignedAmbulance = item.status === "assigned" || item.status === "en_route" ? ambulances[1]?._id : null;
    const destinationHospital = hospitals[0];

    const update = {
      reporterName: item.reporterName,
      reporterPhone: item.reporterPhone,
      description: item.description,
      condition: item.condition,
      severity: item.severity,
      priority: item.priority,
      status: item.status,
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: "seed-script",
      location: { lat: item.lat, lng: item.lng, address: item.address },
      geo: toGeo(item.lat, item.lng),
      assignedAmbulance,
      assignedAt: assignedAmbulance ? new Date(Date.now() - 1000 * 60 * 5) : null,
      destinationHospital: destinationHospital
        ? {
            hospitalProfileId: destinationHospital._id,
            hospitalName: destinationHospital.name,
            distanceKm: 4.8,
            etaMinutes: 11,
            assignedAt: new Date(Date.now() - 1000 * 60 * 4),
          }
        : {},
      timeline: [
        {
          type: "reported",
          message: "Emergency report created",
          actorId: "seed-script",
          actorRole: "system",
          timestamp: new Date(Date.now() - 1000 * 60 * 12),
          meta: {},
        },
        {
          type: "verified",
          message: "Emergency verified by dispatcher",
          actorId: "seed-script",
          actorRole: "dispatcher",
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          meta: {},
        },
      ],
      notes: [
        {
          authorId: "seed-script",
          authorName: "Seed Script",
          note: "Initial seeded incident for dispatcher testing",
          createdAt: new Date(Date.now() - 1000 * 60 * 9),
        },
      ],
      responseMetrics: {
        dispatchDistanceKm: assignedAmbulance ? 3.9 : null,
        dispatchEtaMinutes: assignedAmbulance ? 9 : null,
        timeToAssignSeconds: assignedAmbulance ? 180 : null,
        timeToArriveSeconds: null,
        totalResolutionSeconds: null,
      },
    };

    const row = await Incident.findOneAndUpdate({ incidentCode: item.incidentCode }, update, {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
    });

    incidentRows.push(row);
  }

  if (ambulances[1]) {
    await Ambulance.findByIdAndUpdate(ambulances[1]._id, {
      status: "en_route",
      currentIncident: incidentRows.find((item) => item.status === "en_route")?._id || null,
      dispatchedAt: new Date(Date.now() - 1000 * 60 * 5),
    });
  }

  return incidentRows;
}

async function run() {
  try {
    await connectDB();

    if (shouldReset) {
      await Promise.all([Ambulance.deleteMany({}), HospitalProfile.deleteMany({}), Incident.deleteMany({ incidentCode: /^INC-SEED-/ })]);
      console.log("Existing seed records removed.");
    }

    const ambulances = await seedAmbulances();
    const hospitals = await seedHospitals();
    const incidents = await seedIncidents(ambulances, hospitals);

    console.log(`Seed complete. Ambulances: ${ambulances.length}, Hospitals: ${hospitals.length}, Incidents: ${incidents.length}`);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();
