import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const DispatchMessage = sequelize.define(
  "DispatchMessage",
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
    sender: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    senderRole: {
      type: DataTypes.ENUM("dispatcher", "hospital", "admin", "system"),
    },
    code: {
      type: DataTypes.STRING(50),
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    messageType: {
      type: DataTypes.ENUM("route-update", "alert", "info", "urgent", "normal"),
      defaultValue: "normal",
    },
    priority: {
      type: DataTypes.ENUM("low", "normal", "high", "critical"),
      defaultValue: "normal",
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
    tableName: "dispatch_messages",
    timestamps: false,
    indexes: [
      { fields: ["ambulanceId"] },
      { fields: ["isRead"] },
      { fields: ["priority"] },
      { fields: ["timestamp"] },
    ],
  },
);

export default DispatchMessage;
