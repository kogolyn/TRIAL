import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ambulanceId: {
      type: DataTypes.STRING(50),
    },
    hospitalId: {
      type: DataTypes.INTEGER,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("low", "normal", "high", "critical"),
      defaultValue: "normal",
    },
    payload: {
      type: DataTypes.JSON,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "notifications",
    timestamps: false,
    indexes: [{ fields: ["userId"] }, { fields: ["isRead"] }, { fields: ["timestamp"] }],
  },
);

export default Notification;
