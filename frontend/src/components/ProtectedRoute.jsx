import { Navigate } from "react-router-dom";

function ProtectedRoute({ user, role, children }) {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const activeUser = storedUser || user;

  if (!activeUser) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = Array.isArray(role) ? role : role ? [role] : [];
  if (allowedRoles.length && !allowedRoles.includes(activeUser.role)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
          flexDirection: "column",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h1 style={{ fontSize: "28px", color: "#dc2626", marginBottom: "10px" }}>
          Access Denied
        </h1>
        <p style={{ fontSize: "16px", color: "#4b5563", marginBottom: "20px" }}>
          You do not have permission to access this page.
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
