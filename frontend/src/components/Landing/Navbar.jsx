import { useState } from "react";

function Navbar({ onProceed }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={styles.navbar}>
      {/* Logo/Brand */}
      <div style={styles.brand}>
        <span style={styles.brandRed}>UZIMA</span>
        <span style={styles.brandBlack}>NODE</span>
      </div>

      {/* Desktop Nav Links */}
      <div style={styles.navLinks}>
        <a href="#" style={styles.navLink}>Home</a>
        <a href="#" style={styles.navLink}>About</a>
        <a href="#" style={styles.navLink}>Services</a>
      </div>

      {/* Auth Buttons */}
      <div style={styles.authButtons}>
        <button style={styles.loginBtn} onClick={onProceed}>Login</button>
        <button style={styles.registerBtn} onClick={onProceed}>Register</button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 30px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  },
  brand: {
    fontSize: "22px",
    fontWeight: "900",
    fontFamily: "Segoe UI, sans-serif",
    letterSpacing: "1px",
  },
  brandRed: { color: "#FF3B30" },
  brandBlack: { color: "#111" },
  navLinks: {
    display: "flex",
    gap: "28px",
    alignItems: "center",
  },
  navLink: {
    textDecoration: "none",
    color: "#444",
    fontSize: "15px",
    fontWeight: "600",
    fontFamily: "Segoe UI, sans-serif",
    transition: "color 0.2s",
  },
  authButtons: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  loginBtn: {
    padding: "10px 24px",
    borderRadius: "10px",
    border: "2px solid #FF3B30",
    background: "transparent",
    color: "#FF3B30",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "Segoe UI, sans-serif",
    transition: "all 0.2s ease",
  },
  registerBtn: {
    padding: "10px 24px",
    borderRadius: "10px",
    border: "2px solid #FF3B30",
    background: "#FF3B30",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "Segoe UI, sans-serif",
    transition: "all 0.2s ease",
  },
};

export default Navbar;