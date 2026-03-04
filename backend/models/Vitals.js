import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import { checkCriticalVitals } from "../utils/vitalsValidator.js";

const Vitals = sequelize.define(
  "Vitals",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patientCareId: {
      type: DataTypes.INTEGER,
      references: {
        model: "patient_care",
        key: "id",
      },
    },
    incidentId: {
      type: DataTypes.STRING(50),
    },
    ambulanceId: {
      type: DataTypes.STRING(50),
    },
    heartRate: {
      type: DataTypes.INTEGER,
    },
    bloodPressure: {
      type: DataTypes.STRING(20),
    },
    oxygenLevel: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 100,
      },
    },
    temperature: {
      type: DataTypes.DECIMAL(4, 1),
    },
    respiratoryRate: {
      type: DataTypes.INTEGER,
    },
    isCritical: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    recordedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    recordedBy: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "vitals",
    timestamps: false,
    indexes: [
      { fields: ["patientCareId"] },
      { fields: ["incidentId"] },
      { fields: ["recordedAt"] },
      { fields: ["ambulanceId"] },
    ],
  },
);

Vitals.prototype.checkCritical = function checkCritical() {
  return checkCriticalVitals(this);
};

Vitals.beforeValidate((vitals) => {
  vitals.isCritical = vitals.checkCritical();
});

export default Vitals;
