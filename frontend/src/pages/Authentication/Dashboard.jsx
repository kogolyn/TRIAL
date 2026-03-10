import React from "react";
import { Link } from "react-router-dom";

const roleColors = {
  Dispatcher: "#2563eb",
  "Ambulance Staff": "#dc2626",
  "Medical Personnel": "#16a34a",
  Admin: "#7c3aed",
};

export default function Dashboard() {
  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "30px auto",
        fontFamily: "Arial, sans-serif",
        display: "flex",
      }}
    >
      {/* Vertical boundary line */}
      <div
        style={{
          width: "4px",
          backgroundColor: "#000",
          marginRight: "25px",
        }}
      />

      {/* Roles container */}
      <div style={{ flex: 1 }}>
        {Object.keys(roleColors).map((role) => (
          <Link
            key={role}
            to={`/dashboard/${role.toLowerCase().replace(" ", "-")}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: "18px",
                backgroundColor: roleColors[role],
                color: "white",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "25px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              {role}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
