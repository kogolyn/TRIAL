import Bed from "../../models/hospital/Bed.model.js";
import Equipment from "../../models/hospital/Equipment.model.js";
import BloodBank from "../../models/hospital/BloodBank.model.js";
import IncomingAlert from "../../models/hospital/IncomingAlert.model.js";
import Referral from "../../models/hospital/Referral.model.js";

const ENABLE_SEED = process.env.ENABLE_HOSPITAL_SEED === "false";

export async function ensureAlertsSeed(hospitalId, userId) {
  if (!ENABLE_SEED) return;
  const existing = await IncomingAlert.countDocuments({ hospitalId });
  if (existing > 0) return;

  await IncomingAlert.insertMany([
    {
      ambulanceId: "AMB-2401",
      patientName: "John Doe",
      age: 52,
      gender: "Male",
      condition: "Cardiac Arrest",
      severity: "critical",
      eta: 4,
      unit: "Unit 23-Alpha",
      distance: "2.3 km",
      team: "Cardiology",
      roomAssigned: "Trauma Bay 2",
      vitals: { heartRate: 145, bloodPressure: "180/110", oxygenLevel: 88, temperature: 38.2, respiratoryRate: 28 },
      notes: "CPR in progress, defibrillated x2, IV access established.",
      hospitalId,
    },
    {
      ambulanceId: "AMB-2402",
      patientName: "Jane Smith",
      age: 34,
      gender: "Female",
      condition: "Motor Vehicle Accident",
      severity: "urgent",
      eta: 8,
      unit: "Unit 15-Bravo",
      distance: "5.8 km",
      team: "Trauma",
      roomAssigned: "ER-5",
      vitals: { heartRate: 98, bloodPressure: "130/85", oxygenLevel: 95, temperature: 37.1, respiratoryRate: 18 },
      notes: "Multiple contusions, possible rib fracture. Alert and oriented.",
      hospitalId,
    },
  ]);

  const referralCount = await Referral.countDocuments({ createdBy: userId });
  if (referralCount === 0) {
    await Referral.insertMany([
      {
        direction: "incoming",
        fromFacility: "Riverside Community Hospital",
        patient: "Marcus Osei",
        age: 58,
        condition: "STEMI",
        severity: "critical",
        reason: "No cath lab available at sending facility",
        transport: "Air Ambulance",
        sendingDoctor: "Dr. A. Nkosi",
        notes: "Anterior STEMI confirmed on ECG. Needs urgent PCI.",
        status: "pending",
        createdBy: userId,
      },
      {
        direction: "incoming",
        fromFacility: "North Valley Clinic",
        patient: "Lena Boateng",
        age: 27,
        condition: "Ruptured Ectopic Pregnancy",
        severity: "critical",
        reason: "No OB surgeon on site",
        transport: "Ground Ambulance",
        sendingDoctor: "Dr. P. Mensah",
        notes: "Hemodynamically unstable. Urgent surgical intervention needed.",
        status: "pending",
        createdBy: userId,
      },
    ]);
  }
}

export async function ensureResourcesSeed(hospitalId) {
  if (!ENABLE_SEED) return;
  const bedCount = await Bed.countDocuments({ hospitalId });
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
    await Bed.insertMany(bedDocs);
  }

  const eqCount = await Equipment.countDocuments({ hospitalId });
  if (eqCount === 0) {
    await Equipment.insertMany([
      { hospitalId, name: "Ventilators", totalQuantity: 8, availableQuantity: 3 },
      { hospitalId, name: "CT Scanner", totalQuantity: 2, availableQuantity: 1 },
      { hospitalId, name: "MRI Machine", totalQuantity: 1, availableQuantity: 1 },
      { hospitalId, name: "X-Ray Unit", totalQuantity: 3, availableQuantity: 2 },
      { hospitalId, name: "Ultrasound", totalQuantity: 4, availableQuantity: 3 },
      { hospitalId, name: "Defibrillator", totalQuantity: 6, availableQuantity: 4 },
      { hospitalId, name: "ECG Machine", totalQuantity: 7, availableQuantity: 5 },
      { hospitalId, name: "Infusion Pump", totalQuantity: 15, availableQuantity: 8 },
    ]);
  }

  const bloodCount = await BloodBank.countDocuments({ hospitalId });
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
