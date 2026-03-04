import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const PatientCare = sequelize.define(
  "PatientCare",
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
      allowNull: false,
    },
    patientName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
    },
    medicalCondition: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM("Critical", "Severe", "Moderate", "Mild"),
      allowNull: false,
    },
    estimatedTime: {
      type: DataTypes.STRING(50),
    },
    paramedicReport: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM("pending", "in-progress", "completed", "cancelled"),
      defaultValue: "pending",
    },
    createdBy: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "patient_care",
    timestamps: true,
    indexes: [
      { fields: ["ambulanceId"] },
      { fields: ["incidentId"] },
      { fields: ["severity"] },
      { fields: ["status"] },
    ],
  },
);

export default PatientCare;
