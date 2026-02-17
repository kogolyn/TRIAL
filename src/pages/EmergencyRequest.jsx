import { useEffect, useState } from "react";
import EmergencyConfirm from "./EmergencyConfirm";
import ambulanceImg from "../assets/ambulanceimage.jpg";
import logoImg from "../assets/logo.png";
import Navbar from "../components/Navbar";   {/* ✅ FIXED: was ".components/Navbar" */}

function EmergencyRequest() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("Idle");
  const [showConfirmPage, setShowConfirmPage] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Get location name
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            const address = data.address || {};

            const area =
              address.suburb ||
              address.neighbourhood ||
              address.village ||
              address.town ||
              address.city ||
              "Unknown area";

            setLocation(area);
          } catch {
            setLocation("Unknown area");
          }
        },
        () => setLocation("Location denied")
      );
    }
  }, []);

  // Simulated status
  useEffect(() => {
    const timer = setTimeout(() => setStatus("Enroute"), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (showConfirmPage) {
    return <EmergencyConfirm onCancel={() => setShowConfirmPage(false)} />;
  }

  return (
    <div style={styles.container}>

      {/* NAVBAR */}
      <Navbar />

      {/* HEADER WITH AMBULANCE BACKGROUND */}
      <div style={{ ...styles.header, marginTop: "65px" }}>
        <div style={styles.headerOverlay}></div>

        <div style={styles.headerContent}>
          <img src={logoImg} alt="UzimaNode Logo" style={styles.logo} />
          <p style={styles.subtitle}>Fast Reliable Lifesaving</p>
        </div>
      </div>

      {/* EMERGENCY BUTTON */}
      <div style={styles.buttonWrapper}>
        <div style={styles.pulseRing}></div>
        <div style={styles.pulseRing2}></div>

        <button
          style={{
            ...styles.emergencyButton,
            transform: isHovering ? "scale(1.05)" : "scale(1)",
          }}
          onClick={() => setShowConfirmPage(true)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div style={styles.iconContainer}>🚨</div>

          <div style={styles.buttonTextPrimary}>REQUEST HELP NOW</div>
          <div style={styles.buttonTextSecondary}>
            ⚡ ~4 min response time
          </div>
        </button>
      </div>

      {/* INFO CARDS */}
      <div style={styles.infoCards}>
        {/* Status Card - Green */}
        <div style={{ ...styles.infoCard, background: "linear-gradient(135deg, #d4f4dd 0%, #a7f3d0 100%)" }}>
          <div style={styles.cardIconWrapper}>⏱</div>
          <div style={{ ...styles.cardLabel, color: "#065f46" }}>STATUS</div>
          <div style={{ ...styles.cardValue, color: "#064e3b" }}>{status}</div>
        </div>

        {/* Location Card - Blue */}
        <div style={{ ...styles.infoCard, background: "linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)" }}>
          <div style={styles.cardIconWrapper}>📍</div>
          <div style={{ ...styles.cardLabel, color: "#1e3a8a" }}>YOUR LOCATION</div>
          <div style={{ ...styles.cardValue, color: "#1e40af" }}>{location || "Detecting..."}</div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={styles.bottomInfo}>
        <div style={styles.infoItem}>
          <span style={styles.infoText}>24/7 Emergency Support</span>
        </div>
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "Segoe UI, sans-serif",
    background: "#E8F5E9",
  },

  header: {
    borderRadius: "20px",
    overflow: "hidden",
    marginBottom: "30px",
    position: "relative",
    backgroundImage: `url(${ambulanceImg})`,
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundColor: "#000",
    padding: "100px 20px",
    textAlign: "center",
  },

  headerOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
  },

  headerContent: {
    position: "relative",
    zIndex: 2,
  },

  logo: { height: "350px" },

  subtitle: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: "600",
    marginTop: "10px",
  },

  buttonWrapper: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
  },

  pulseRing: {
    position: "absolute",
    width: "200px",
    height: "200px",
    border: "3px solid #FF3B30",
    borderRadius: "50%",
    animation: "pulse 2s infinite",
  },

  pulseRing2: {
    position: "absolute",
    width: "200px",
    height: "200px",
    border: "3px solid #FF3B30",
    borderRadius: "50%",
    animation: "pulse 2s infinite 1s",
  },

  emergencyButton: {
    backgroundColor: "#FF3B30",
    color: "#fff",
    borderRadius: "24px",
    padding: "40px",
    border: "none",
    cursor: "pointer",
    zIndex: 2,
    width: "100%",
    maxWidth: "400px",
    transition: "transform 0.2s ease",
  },

  iconContainer: {
    fontSize: "50px",
    marginBottom: "10px",
    animation: "float 3s infinite",
  },

  buttonTextPrimary: { fontSize: "22px", fontWeight: "700" },
  buttonTextSecondary: { fontSize: "14px", opacity: 0.9 },

  infoCards: {
    display: "flex",
    gap: "15px",
    maxWidth: "500px",
    margin: "0 auto 30px",
  },

  infoCard: {
    flex: 1,
    borderRadius: "18px",
    padding: "24px 20px",
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
    border: "2px solid rgba(255, 255, 255, 0.6)",
    transition: "transform 0.2s ease",
  },

  cardIconWrapper: {
    width: "55px",
    height: "55px",
    margin: "0 auto 12px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    background: "rgba(255, 255, 255, 0.9)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
  },

  cardLabel: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.8px",
    marginBottom: "6px",
    textTransform: "uppercase",
  },

  cardValue: { fontSize: "18px", fontWeight: "800" },

  bottomInfo: { textAlign: "center" },

  infoItem: {
    background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
    padding: "14px 22px",
    borderRadius: "20px",
    display: "inline-block",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },

  infoText: {
    fontSize: "13px",
    color: "#475569",
    fontWeight: "800",
  },
};

export default EmergencyRequest;