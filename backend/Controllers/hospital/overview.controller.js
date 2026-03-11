import IncomingAlert from "../../models/hospital/IncomingAlert.model.js";
import Referral from "../../models/hospital/Referral.model.js";
import Bed from "../../models/hospital/Bed.model.js";
import { ensureAlertsSeed, ensureResourcesSeed } from "./seed.js";

export async function getOverview(req, res) {
  try {
    const hospitalId = req.user.id;
    await ensureAlertsSeed(hospitalId, req.user.id);
    await ensureResourcesSeed(hospitalId);

    const [alerts, referrals, beds, intake24h] = await Promise.all([
      IncomingAlert.find({ hospitalId, status: { $ne: "cancelled" } }).sort({ createdAt: -1 }).lean(),
      Referral.find({ createdBy: req.user.id, direction: "incoming", status: "pending" }).lean(),
      Bed.find({ hospitalId }).lean(),
      IncomingAlert.countDocuments({ hospitalId, createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24) } }),
    ]);

    const deptMap = new Map();
    beds.forEach((b) => {
      if (!deptMap.has(b.department)) deptMap.set(b.department, { dept: b.department, available: 0, total: 0 });
      const row = deptMap.get(b.department);
      row.total += 1;
      if (b.status === "available") row.available += 1;
    });

    const bedSnapshot = Array.from(deptMap.values()).sort((a, b) => a.dept.localeCompare(b.dept)).slice(0, 6);
    const totalBeds = bedSnapshot.reduce((acc, d) => acc + d.total, 0);
    const availableBeds = bedSnapshot.reduce((acc, d) => acc + d.available, 0);
    const occupancyPct = totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0;

    res.status(200).json({
      kpis: {
        incoming: referrals.length,
        availableBeds,
        avgTriageTime: "14m",
        intake24h,
      },
      alertsPreview: alerts.slice(0, 2).map((a) => ({
        id: a.ambulanceId,
        name: a.patientName,
        condition: a.condition,
        eta: `${a.eta} min`,
        severity: a.severity,
      })),
      bedSnapshot,
      capacity: {
        occupancyPct,
        projectedIn2h: "75%",
        peakTimeToday: "18:00",
        todayIntake: String(intake24h),
        avgStay: "3.2h",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch overview", error: error.message });
  }
}
