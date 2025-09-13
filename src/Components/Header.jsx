import React, { useState, useEffect, useMemo, useRef } from "react";
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
  const [accountOpen, setAccountOpen] = useState(false);

  const accountRef = useRef(null);

  // Close account dropdown on outside click or ESC
  useEffect(() => {
    const onClick = (e) => {
      if (!accountRef.current) return;
      if (!accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Handle resize (desktop vs mobile)
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      if (desktop) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Nav links: add Dashboard when authenticated
  const navLinks = useMemo(
    () => (user ? [...baseLinks, { to: "/dashboard", label: "Dashboard" }] : baseLinks),
    [user]
  );

  const handleSignOut = async () => {
    try {
      await logout();
      setAccountOpen(false);
      setIsMenuOpen(false);
      navigate("/");
    } catch {
      /* noop */
    }
  };

  const displayName =
    user?.displayName ||
    (user?.email ? user.email.split("@")[0] : "User");

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
            {navLinks.map(({ to, label }) => (
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

          {/* Right controls */}
          <div style={styles.rightControls}>
            {!user ? (
              <NavLink to="/login" style={styles.loginCta} className="nav-link">
                Log in
              </NavLink>
            ) : (
              <div ref={accountRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  style={styles.avatarButton}
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      style={styles.avatarImg}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div style={styles.avatarFallback}>{avatarInitial}</div>
                  )}
                </button>

                {accountOpen && (
                  <div role="menu" style={styles.menu}>
                    <div style={styles.menuHeader}>
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          style={styles.menuAvatar}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div style={styles.menuAvatarFallback}>{avatarInitial}</div>
                      )}
                      <div>
                        <div style={styles.menuName}>{displayName}</div>
                        <div style={styles.menuEmail}>{user?.email}</div>
                      </div>
                    </div>

                    <div style={styles.menuDivider} />

                    <button
                      type="button"
                      style={styles.menuItem}
                      onClick={handleSignOut}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Mobile
        <div>
          <button
            aria-label="Toggle menu"
            onClick={() => setIsMenuOpen((v) => !v)}
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
              {navLinks.map(({ to, label }) => (
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

              {/* Account block in mobile */}
              <div style={styles.mobileDivider} />
              {!user ? (
                <NavLink
                  to="/login"
                  style={styles.loginCtaFull}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </NavLink>
              ) : (
                <div style={styles.mobileAccount}>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      style={styles.menuAvatar}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div style={styles.menuAvatarFallback}>{avatarInitial}</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.menuName}>{displayName}</div>
                    <div style={styles.menuEmail}>{user.email}</div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    style={styles.signOutBtnFull}
                  >
                    Sign out
                  </button>
                </div>
              )}
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
  desktopRow: { display: "flex", alignItems: "center", gap: 20 },
  nav: { display: "flex", gap: 24 },
  navLink: { textDecoration: "none", fontSize: 16, transition: "color 0.3s ease" },
  rightControls: { display: "flex", alignItems: "center", gap: 12, marginLeft: 8 },

  // Buttons / Avatar
  loginCta: {
    textDecoration: "none",
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 600,
    border: "1px solid #e5e7eb",
  },
  avatarButton: {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },
  avatarImg: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #e5e7eb",
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    display: "grid",
    placeItems: "center",
    fontSize: 14,
    fontWeight: 700,
    border: "1px solid #e5e7eb",
  },

  // Dropdown menu
  menu: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 10px)",
    width: 280,
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    padding: 10,
    zIndex: 2000,
  },
  menuHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "6px 6px 10px",
  },
  menuAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #e5e7eb",
  },
  menuAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    display: "grid",
    placeItems: "center",
    fontSize: 16,
    fontWeight: 700,
    border: "1px solid #e5e7eb",
  },
  menuName: { fontSize: 14, fontWeight: 700, color: "#111827", lineHeight: 1.2 },
  menuEmail: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 180,
  },
  menuDivider: { height: 1, backgroundColor: "#f1f5f9", margin: "6px 0 8px" },
  menuItem: {
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    padding: "10px 8px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    color: "#111827",
  },

  // Mobile
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
  bar: { width: 30, height: 3, backgroundColor: "#333", borderRadius: 2, transition: "all 0.3s ease" },
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
    minWidth: 200,
  },
  mobileNavLink: {
    textDecoration: "none",
    fontSize: 16,
    padding: "8px 12px",
    borderRadius: 4,
    transition: "color 0.3s ease",
  },
  mobileDivider: { height: 1, backgroundColor: "#f1f5f9", margin: "6px 0" },
  mobileAccount: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  signOutBtnFull: {
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
