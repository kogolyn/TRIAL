import { useState } from "react";

function EmergencyConfirm({ onCancel }) {
  const [emergencyType, setEmergencyType] = useState("");
  const [locationNotes, setLocationNotes] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const confirmEmergency = () => {
    if (!emergencyType) {
      alert("Please select an emergency type");
      return;
    }
    setIsConfirmed(true);
  };

  const handleReset = () => {
    setIsConfirmed(false);
    setEmergencyType("");
    setLocationNotes("");
    onCancel();
  };

  if (isConfirmed) {
    return (
      <div style={styles.fullScreen}>
        <div style={styles.successCard}>
          {/* Animated Icon Circle */}
          <div style={styles.iconCircle}>
            <div style={styles.pulseCircle}></div>
            <div style={styles.ambulanceIcon}>🚑</div>
          </div>

          <h2 style={styles.successTitle}>HELP IS ON THE WAY</h2>

          <span style={styles.statusBadge}>
            <span style={styles.statusDot}></span>
            EN ROUTE
          </span>

          <p style={styles.successText}>
            Emergency services have received your alert and are heading to your location.
          </p>

          <div style={styles.etaBox}>
            <div style={styles.etaIcon}>⏱</div>
            <div>
              <div style={styles.etaLabel}>Estimated Arrival</div>
              <div style={styles.etaTime}>4 minutes</div>
            </div>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>📍</span>
              <span style={styles.infoText}>Location Confirmed</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>📞</span>
              <span style={styles.infoText}>Stay Available</span>
            </div>
          </div>

          <button style={styles.resetButton} onClick={handleReset}>
            Report another incident
          </button>
        </div>

        {/* Animations */}
        <style>{`
          @keyframes pulse-ring {
            0% {
              transform: scale(1);
              opacity: 0.8;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }

          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  }


  return (
    <div style={styles.wrapper}>
      <button style={styles.backButton} onClick={onCancel}>
        ← Back
      </button>

      <div style={styles.container}>
        <h2 style={styles.header}>Select Emergency Type</h2>

        <div style={styles.optionsGrid}>
          {types.map((type) => {
            const active = emergencyType === type.key;
            return (
              <div
                key={type.key}
                style={{
                  ...styles.optionCard,
                  borderColor: active ? "#FF0000" : "#eee",
                  backgroundColor: active ? "#fff5f5" : "#fff",
                  transform: active ? "scale(1.02)" : "scale(1)",
                }}
                onClick={() => setEmergencyType(type.key)}
              >
                <div style={styles.optionIcon}>{type.icon}</div>
                <div style={styles.optionText}>{type.label}</div>
              </div>
            );
          })}
        </div>

        <div style={styles.section}>
          <label style={styles.label}>LOCATION NOTES (OPTIONAL)</label>
          <textarea
            style={styles.textarea}
            placeholder="e.g. near the main gate, second floor"
            value={locationNotes}
            onChange={(e) => setLocationNotes(e.target.value)}
          />
        </div>

        <button style={styles.confirmBtn} onClick={confirmEmergency}>
          Confirm Emergency →
        </button>
      </div>
    </div>
  );
}

const types = [
  {
    key: "Medical",
    label: "Medical Emergency",
    icon: "🩺",
  },
  {
    key: "Accident",
    label: "Traffic Accident",
    icon: "🚗",
  },
  {
    key: "Fire",
    label: "Fire / Smoke",
    icon: "🔥",
  },
];

const styles = {
  wrapper: {
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "Segoe UI, sans-serif",
    background: "#e8f5e9",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    background: "#fff",
    borderRadius: "18px",
    padding: "25px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
    maxWidth: "480px",
    width: "100%",
  },

  header: {
    fontSize: "22px",
    fontWeight: "800",
    marginBottom: "20px",
  },

  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "14px",
    marginBottom: "25px",
  },

  optionCard: {
    display: "flex",
    alignItems: "center",
    padding: "18px",
    borderRadius: "14px",
    border: "2px solid #eee",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  optionIcon: {
    fontSize: "28px",
    marginRight: "15px",
  },

  optionText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111",
  },

  section: {
    marginBottom: "20px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "8px",
    display: "block",
    color: "#555",
  },

  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #eee",
    fontSize: "14px",
    resize: "none",
  },

  confirmBtn: {
    width: "100%",
    padding: "18px",
    borderRadius: "12px",
    background: "#FF0000",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(255,0,0,0.25)",
  },

  backButton: {
    background: "none",
    border: "none",
    marginBottom: "10px",
    cursor: "pointer",
    color: "#666",
  },

  fullScreen: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#e8f5e9",
    padding: "20px",
    textAlign: "center",
  },

  successCard: {
    background: "#fff",
    padding: "50px 40px",
    borderRadius: "28px",
    boxShadow: "0 20px 60px rgba(40, 167, 69, 0.2)",
    maxWidth: "550px",
    border: "3px solid #28a745",
  },

  iconCircle: {
    position: "relative",
    width: "120px",
    height: "120px",
    margin: "0 auto 25px",
  },

  pulseCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: "4px solid #28a745",
    animation: "pulse-ring 2s ease-out infinite",
  },

  ambulanceIcon: {
    position: "relative",
    fontSize: "70px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "120px",
  },

  successTitle: {
    fontSize: "36px",
    fontWeight: "900",
    marginBottom: "20px",
    color: "#1a1a1a",
    letterSpacing: "0.5px",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#28a745",
    color: "#ffffff",
    padding: "12px 28px",
    borderRadius: "30px",
    fontSize: "18px",
    fontWeight: "900",
    marginBottom: "25px",
    letterSpacing: "1.5px",
    boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)",
  },

  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    animation: "blink 1.5s ease-in-out infinite",
  },

  successText: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "35px",
    lineHeight: "1.7",
    fontWeight: "500",
  },

  etaBox: {
    background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%)",
    padding: "25px",
    borderRadius: "18px",
    fontSize: "18px",
    marginBottom: "30px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    border: "2px solid #d4edda",
  },

  etaIcon: {
    fontSize: "40px",
  },

  etaLabel: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "5px",
    textAlign: "left",
  },

  etaTime: {
    fontSize: "24px",
    fontWeight: "900",
    color: "#28a745",
    textAlign: "left",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "30px",
  },

  infoItem: {
    background: "#f8f9fa",
    padding: "15px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#555",
  },

  infoIcon: {
    fontSize: "20px",
  },

  infoText: {
    fontSize: "13px",
  },

  resetButton: {
    background: "none",
    border: "none",
    color: "#28a745",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "underline",
  },
};

export default EmergencyConfirm;