import Bed from "../../models/hospital/Bed.model.js";
import Equipment from "../../models/hospital/Equipment.model.js";
import BloodBank from "../../models/hospital/BloodBank.model.js";
import { ensureResourcesSeed } from "./seed.js";

export async function getResources(req, res) {
  try {
    const hospitalId = req.user.id;
    await ensureResourcesSeed(hospitalId);

    const beds = await Bed.find({ hospitalId }).lean();
    const equipment = await Equipment.find({ hospitalId }).lean();
    const blood = await BloodBank.find({ hospitalId }).sort({ bloodType: 1 }).lean();

    const deptMap = new Map();
    beds.forEach((b) => {
      if (!deptMap.has(b.department)) {
        deptMap.set(b.department, { dept: b.department, total: 0, available: 0 });
      }
      const row = deptMap.get(b.department);
      row.total += 1;
      if (b.status === "available") row.available += 1;
    });

    const bedSnapshot = Array.from(deptMap.values()).sort((a, b) => a.dept.localeCompare(b.dept));
    const totalBeds = bedSnapshot.reduce((sum, d) => sum + d.total, 0);
    const availableBeds = bedSnapshot.reduce((sum, d) => sum + d.available, 0);

    res.status(200).json({
      bedSnapshot,
      equipment: equipment.map((e) => ({ name: e.name, total: e.totalQuantity, available: e.availableQuantity })),
      blood: blood.map((b) => ({ type: b.bloodType, units: b.unitsAvailable, min: b.minimumThreshold })),
      summary: {
        totalBeds,
        availableBeds,
        occupancyPct: totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resources", error: error.message });
  }
}
