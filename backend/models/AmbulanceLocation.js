import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const AmbulanceLocation = sequelize.define(
  "AmbulanceLocation",
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
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    speed: {
      type: DataTypes.INTEGER,
    },
    heading: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 360,
      },
    },
    status: {
      type: DataTypes.ENUM(
        "Off Duty",
        "Active Duty",
        "En Route",
        "At Scene",
        "Transporting",
      ),
      defaultValue: "Active Duty",
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ambulance_locations",
    timestamps: false,
    indexes: [{ fields: ["ambulanceId"] }, { fields: ["timestamp"] }],
  },
);

export default AmbulanceLocation;
