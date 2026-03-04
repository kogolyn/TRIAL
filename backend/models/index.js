import sequelize from "../config/sequelize.js";
import PatientCare from "./PatientCare.js";
import Vitals from "./Vitals.js";
import DispatchMessage from "./DispatchMessage.js";
import AmbulanceLocation from "./AmbulanceLocation.js";
import EmergencyAlert from "./EmergencyAlert.js";
import Notification from "./Notification.js";
import Facility from "./Facility.js";
import CrewAssignment from "./CrewAssignment.js";

PatientCare.hasMany(Vitals, {
  foreignKey: "patientCareId",
  as: "vitals",
});
Vitals.belongsTo(PatientCare, {
  foreignKey: "patientCareId",
  as: "patientCare",
});

export {
  sequelize,
  PatientCare,
  Vitals,
  DispatchMessage,
  AmbulanceLocation,
  EmergencyAlert,
  Notification,
  Facility,
  CrewAssignment,
};
