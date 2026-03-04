export function checkCriticalVitals(vitals) {
  const heartRate = Number(vitals.heartRate);
  const oxygenLevel = Number(vitals.oxygenLevel);
  const temperature = Number(vitals.temperature);
  const respiratoryRate = Number(vitals.respiratoryRate);

  if (!Number.isNaN(heartRate) && (heartRate < 40 || heartRate > 120)) {
    return true;
  }

  if (!Number.isNaN(oxygenLevel) && oxygenLevel < 90) {
    return true;
  }

  if (!Number.isNaN(temperature) && (temperature < 35 || temperature > 39)) {
    return true;
  }

  if (
    !Number.isNaN(respiratoryRate) &&
    (respiratoryRate < 10 || respiratoryRate > 25)
  ) {
    return true;
  }

  if (typeof vitals.bloodPressure === "string") {
    const systolic = Number(vitals.bloodPressure.split("/")[0]);
    if (!Number.isNaN(systolic) && (systolic < 90 || systolic > 180)) {
      return true;
    }
  }

  return false;
}
