import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const EmergencyAlert = sequelize.define(
  "EmergencyAlert",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ambulanceId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    incidentId: {
      type: DataTypes.STRING(50),
    },
    alertType: {
      type: DataTypes.ENUM(
        "patient-critical",
        "equipment-failure",
        "route-blocked",
        "backup-needed",
        "other",
      ),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isResolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    resolvedAt: {
      type: DataTypes.DATE,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "emergency_alerts",
    updatedAt: false,
    indexes: [
      { fields: ["ambulanceId"] },
      { fields: ["isResolved"] },
      { fields: ["alertType"] },
    ],
  },
);

export default EmergencyAlert;
