import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const CrewAssignment = sequelize.define(
  "CrewAssignment",
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
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(100),
    },
    status: {
      type: DataTypes.ENUM("on-duty", "off-duty", "break"),
      defaultValue: "on-duty",
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "crew_assignments",
    timestamps: false,
    indexes: [{ fields: ["ambulanceId"] }, { fields: ["userId"] }],
  },
);

export default CrewAssignment;
