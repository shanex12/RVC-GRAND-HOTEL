import { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerBooking from "./pages/CustomerBooking";
import { AdminRoute, ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";


export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={handleLogout} isAdmin={user?.role === 'admin'}>
              <CustomerBooking />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AppLayout onLogout={handleLogout} isAdmin={true}>
              <AdminDashboard />
            </AppLayout>
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppLayout({ children, onLogout, isAdmin }) {
  const { user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f8f7f4", overflowY: "hidden"}}>
      {/* SIDEBAR - Fixed Height with Overflow */}
      <div style={{...styles.sidebar, maxHeight: '100vh', overflowY: 'auto' , height: "100vh"}}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logoBox}>
            <h1 style={styles.logo}>🏨</h1>
          </div>
          <h2 style={styles.hotelName}>RVC HOTEL</h2>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {isAdmin ? (
            <>
              <Link
                to="/"
                style={styles.navLink(location.pathname === "/")}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "rgba(14,165,233,0.15)";
                  e.target.style.borderLeftColor = "#0ea5e9";
                }}
                onMouseOut={(e) => {
                  if (location.pathname === "/") {
                    e.target.style.backgroundColor = "rgba(14,165,233,0.15)";
                    e.target.style.borderLeftColor = "#0ea5e9";
                  } else {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.borderLeftColor = "transparent";
                  }
                }}
              >
                <span style={{ marginRight: '12px' }}>🏠</span>
                <span>จองห้อง</span>
              </Link>
              <Link
                to="/admin"
                style={styles.navLink(location.pathname === "/admin")}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "rgba(14,165,233,0.2)";
                }}
                onMouseOut={(e) => {
                  if (location.pathname === "/admin") {
                    e.target.style.backgroundColor = "rgba(14,165,233,0.15)";
                  } else {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                <span style={{ marginRight: '12px' }}>📊</span>
                <span>จัดการระบบ</span>
              </Link>
            </>
          ) : (
            <Link
              to="/"
              style={styles.navLink(location.pathname === "/")}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "rgba(14,165,233,0.2)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = location.pathname === "/" ? "rgba(14,165,233,0.15)" : "transparent";
              }}
            >
              <span style={{ marginRight: '12px' }}>🏠</span>
              <span>จองห้อง</span>
            </Link>
          )}
        </nav>

        {/* User Section */}
        <div style={styles.userSection}>
          <button
            style={styles.logoutBtn}
            onClick={handleLogoutClick}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#dc2626";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#ef4444";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <span style={{ marginRight: '8px' }}>🚪</span>
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TOP BAR */}
        <div style={styles.topBar}>
          <div style={styles.topBarContent}>
            <div>
              <h1 style={styles.pageTitle}>
                {isAdmin ? "⚙️ Admin Dashboard" : "👤 จองห้องพัก"}
              </h1>
              <p style={styles.pageSubtitle}>
                {isAdmin ? "จัดการโรงแรมและการจอง" : "เลือกห้องพักที่สวยงาม"}
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowLogoutConfirm(false)}>
          <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.confirmTitle}>ยืนยันการออกจากระบบ</h2>
            <p style={styles.confirmText}>
              คุณต้องการออกจากระบบหรือไม่?
            </p>
            <div style={styles.buttonGroup}>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowLogoutConfirm(false)}
                onMouseOver={(e) => e.target.style.backgroundColor = "#e5e7eb"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#f3f4f6"}
              >
                ยกเลิก
              </button>
              <button
                style={styles.confirmBtn}
                onClick={confirmLogout}
                onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  sidebar: {
    width: 300 ,
    background: "linear-gradient(180deg, #0369a1 0%, #0ea5e9 100%)",
    color: "#fff",
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 20px rgba(2,6,23,0.12)',
    borderRight: "1px solid rgba(14,165,233,0.12)",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
  },
  logoSection: {
    padding: '40px 20px',
    textAlign: 'center',
    borderBottom: '2px solid rgba(255,255,255,0.1)',
    background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
  },
  logoBox: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  logo: {
    margin: 0,
    fontSize: '48px',
  },
  hotelName: {
    margin: '0 0 5px 0',
    fontSize: '26px',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '2px',
  },
  tagline: {
    margin: 0,
    fontSize: '12px',
    color: 'rgba(212,175,55,0.8)',
    letterSpacing: '3px',
    fontWeight: '600',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    padding: '30px 0',
    flex: 1,
  },
  navLink: (isActive) => ({
    padding: "16px 25px",
    backgroundColor: isActive ? "rgba(212,175,55,0.15)" : "transparent",
    color: "#fff",
    border: "none",
    borderLeft: isActive ? "3px solid #d4af37" : "3px solid transparent",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
    textAlign: "left",
    transition: "all 0.3s ease",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
  }),
  userSection: {
    padding: '30px 20px',
    borderTop: '2px solid rgba(14,165,233,0.12)',
    background: "linear-gradient(180deg, rgba(14,165,233,0.03) 0%, transparent 100%)",
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    backgroundColor: 'rgba(14,165,233,0.06)',
    borderRadius: '10px',
    marginBottom: '15px',
    border: '1px solid rgba(14,165,233,0.12)',
  },
  userAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#60a5fa,#06b6d4)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },
  userRole: {
    margin: 0,
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
  },
  logoutBtn: {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    backgroundColor: "#fff",
    padding: "25px 40px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    borderBottom: "1px solid #e5e7eb",
    background: "linear-gradient(90deg, #fff 0%, rgba(212,175,55,0.02) 100%)",
  },
  topBarContent: {
    flex: 1,
  },
  pageTitle: {
    margin: '0 0 5px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  pageSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  confirmModal: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    padding: "40px",
    width: "90%",
    maxWidth: "400px",
    border: "2px solid rgba(212,175,55,0.2)",
  },
  confirmTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 15px 0",
  },
  confirmText: {
    fontSize: "15px",
    color: "#666",
    margin: "0 0 25px 0",
    lineHeight: "1.6",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#f3f4f6",
    color: "#333",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  confirmBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
};