import Hospital from "../../models/hospital.model.js";

export async function resolveHospitalForUser(user) {
  const userId = user?.id;
  if (!userId) return null;

  let hospital = await Hospital.findOne({ userId });
  if (!hospital && user?.email) {
    hospital = await Hospital.findOne({ contactEmail: String(user.email).toLowerCase() });
    if (hospital && !hospital.userId) {
      hospital.userId = userId;
      await hospital.save();
    }
  }
  if (!hospital) {
    const name = user?.name ? `${user.name} Hospital` : "Hospital";
    hospital = await Hospital.create({
      name,
      userId,
      contactEmail: user?.email ? String(user.email).toLowerCase() : undefined,
    });
  }

  return hospital;
}
