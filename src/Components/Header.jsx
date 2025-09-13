import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const baseLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/community", label: "Community" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth > 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      if (desktop) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const authedLinks = user
    ? [...baseLinks, { to: "/dashboard", label: "Dashboard" }]
    : [...baseLinks, { to: "/login", label: "Login" }];

  const handleSignOut = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      navigate("/");
    } catch {
      // noop; you can toast an error here if you have a toast system
    }
  };

  const avatarInitial =
    (user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <header style={styles.header}>
      {/* Logo */}
      <div style={styles.logo} onClick={() => navigate("/")} role="button">
        <span style={styles.logoText}>Empower</span>
        <span style={styles.logoTextGradient}>360</span>
      </div>

      {/* Desktop */}
      {isDesktop ? (
        <div style={styles.desktopRow}>
          <nav style={styles.nav}>
            {authedLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  ...styles.navLink,
                  color: isActive ? "#0056b3" : "#333",
                })}
                className="nav-link"
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right auth controls */}
          <div style={styles.rightControls}>
            {user ? (
              <>
                {/* Avatar */}
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    style={styles.avatarImg}
                  />
                ) : (
                  <div style={styles.avatarFallback}>{avatarInitial}</div>
                )}
                <button
                  onClick={handleSignOut}
                  style={styles.signOutBtn}
                  aria-label="Sign out"
                >
                  Sign out
                </button>
              </>
            ) : (
              <NavLink to="/login" style={styles.loginCta} className="nav-link">
                Log in
              </NavLink>
            )}
          </div>
        </div>
      ) : (
        // Mobile
        <div>
          <button
            aria-label="Toggle menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={styles.menuButton}
          >
            <div
              style={{
                ...styles.bar,
                transform: isMenuOpen
                  ? "rotate(45deg) translate(5px, 5px)"
                  : "none",
              }}
            />
            <div style={{ ...styles.bar, opacity: isMenuOpen ? 0 : 1 }} />
            <div
              style={{
                ...styles.bar,
                transform: isMenuOpen
                  ? "rotate(-45deg) translate(5px, -5px)"
                  : "none",
              }}
            />
          </button>

          {isMenuOpen && (
            <nav style={styles.mobileNav}>
              {authedLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  style={({ isActive }) => ({
                    ...styles.mobileNavLink,
                    color: isActive ? "#0056b3" : "#333",
                  })}
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}

              {/* Auth control for mobile */}
              <div style={{ marginTop: 8 }}>
                {user ? (
                  <button
                    onClick={handleSignOut}
                    style={styles.signOutBtnFull}
                  >
                    Sign out
                  </button>
                ) : (
                  <NavLink
                    to="/login"
                    style={styles.loginCtaFull}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log in
                  </NavLink>
                )}
              </div>
            </nav>
          )}
        </div>
      )}

      <style>{`
        .nav-link:hover { color: #007bff !important; }
        .mobile-nav-link:hover { color: #007bff !important; }
      `}</style>
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    height: 60,
    backgroundColor: "#fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  logo: {
    fontWeight: "bold",
    fontSize: 24,
    cursor: "pointer",
    userSelect: "none",
    display: "flex",
    alignItems: "baseline",
  },
  logoText: { color: "#333" },
  logoTextGradient: {
    background: "linear-gradient(90deg, #6366f1, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 900,
    marginLeft: 4,
  },
  desktopRow: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  nav: {
    display: "flex",
    gap: 24,
  },
  navLink: {
    textDecoration: "none",
    fontSize: 16,
    transition: "color 0.3s ease",
  },
  rightControls: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginLeft: 8,
  },
  avatarImg: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #e5e7eb",
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    display: "grid",
    placeItems: "center",
    fontSize: 14,
    fontWeight: 700,
    border: "1px solid #e5e7eb",
  },
  signOutBtn: {
    backgroundColor: "#111827",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
  },
  loginCta: {
    textDecoration: "none",
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 600,
    border: "1px solid #e5e7eb",
  },
  menuButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    height: 24,
    width: 30,
  },
  bar: {
    width: 30,
    height: 3,
    backgroundColor: "#333",
    borderRadius: 2,
    transition: "all 0.3s ease",
  },
  mobileNav: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    padding: 10,
    gap: 12,
    zIndex: 9999,
    minWidth: 180,
  },
  mobileNavLink: {
    textDecoration: "none",
    fontSize: 16,
    padding: "8px 12px",
    borderRadius: 4,
    transition: "color 0.3s ease",
  },
  signOutBtnFull: {
    width: "100%",
    backgroundColor: "#111827",
    color: "#fff",
    border: "none",
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
  },
  loginCtaFull: {
    display: "block",
    width: "100%",
    textAlign: "center",
    textDecoration: "none",
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    padding: "10px 12px",
    borderRadius: 8,
    fontWeight: 600,
    border: "1px solid #e5e7eb",
  },
};

export default Header;
