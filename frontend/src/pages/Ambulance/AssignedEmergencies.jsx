// src/Components/AssignedEmergencies.jsx
import React from "react";
import { assignedEmergencies } from "../mockData";

const AssignedEmergencies = () => {
  return (
    <div>
      <h2>Assigned Emergencies</h2>
      {assignedEmergencies.map((emergency) => (
        <div key={emergency.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px", borderRadius: "8px" }}>
          <h3>{emergency.incident} <span style={{ color: "red" }}>{emergency.status}</span></h3>
          <p><strong>Patient:</strong> {emergency.patient.name}, {emergency.patient.age} yrs, {emergency.patient.condition}</p>
          <p><strong>Location:</strong> {emergency.location.address}</p>
          <p><strong>Hospital:</strong> {emergency.hospital}</p>
        </div>
      ))}
    </div>
  );
};

export default function AssignedEmergencies() {
  return <div>Assigned Emergencies works</div>;
};
