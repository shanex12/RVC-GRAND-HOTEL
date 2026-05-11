import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getActiveBookings, checkoutBooking, checkinBooking, getAllRooms, getUsers, topUpCredit } from '../api/admin';
import StatCard from '../components/StatCard';
import BookingTable from '../components/BookingTable';
import AddRoomForm from '../components/AddRoomForm';
import RoomList from '../components/RoomList';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [topUpAmounts, setTopUpAmounts] = useState({});
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBookings = async () => {
    try {
      const data = await getActiveBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setBookings([]);
    }
  };

  const loadRooms = async () => {
    try {
      const data = await getAllRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading rooms:', err);
      setRooms([]);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getUsers(token);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading users:', err);
      setUsers([]);
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadBookings(), loadRooms(), loadUsers()]);
      } catch (err) {
        console.error('Dashboard init error:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
  }, [token]);

  const handleCheckin = async (id) => {
    if (!confirm('ยืนยันเช็คอิน?')) return;
    try {
      await checkinBooking(id);
      loadBookings();
      loadRooms();
    } catch (err) {
      alert('เช็คอินไม่สำเร็จ');
    }
  };

  const handleCheckout = async (id) => {
    if (!confirm('ยืนยันเช็กเอาท์?')) return;
    try {
      await checkoutBooking(id);
      loadBookings();
      loadRooms();
    } catch (err) {
      alert('เช็คเอาท์ไม่สำเร็จ');
    }
  };

  const handleTopUp = async (userId) => {
    const amount = Number(topUpAmounts[userId] || 0);
    if (!amount || amount <= 0) {
      alert('กรุณาระบุจำนวนเครดิตที่ต้องการเติม');
      return;
    }
    try {
      await topUpCredit(userId, amount, token);
      alert('เติมเครดิตสำเร็จ');
      setTopUpAmounts((prev) => ({ ...prev, [userId]: '' }));
      loadUsers();
    } catch (err) {
      alert(err.message || 'เติมเครดิตไม่สำเร็จ');
    }
  };

  const checkedInCount = bookings.filter(b => b.status === 'checked_in').length;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏨 Admin Dashboard</h1>
          <p style={styles.subtitle}>จัดการการจองและห้องพักของคุณ</p>
        </div>

        {loading && (
          <div style={styles.loadingBox}>
            <p>⏳ กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <p>❌ {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats */}
            <div style={styles.statsGrid}>
          <StatCard 
            title="ผู้เข้าพักแล้ว" 
            value={checkedInCount}
            icon="👥"
            color="#667eea"
          />
          <StatCard 
            title="รอเข้าพัก" 
            value={bookings.length - checkedInCount}
            icon="⏳"
            color="#f59e0b"
          />
          <StatCard 
            title="ทั้งหมด" 
            value={bookings.length}
            icon="📊"
            color="#10b981"
          />
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('bookings')}
            style={styles.tabButton(activeTab === 'bookings')}
            onMouseOver={(e) => {
              if (activeTab !== 'bookings') e.target.style.backgroundColor = '#f0f0f0';
            }}
            onMouseOut={(e) => {
              if (activeTab !== 'bookings') e.target.style.backgroundColor = '#fff';
            }}
          >
            📋 รายการจอง
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            style={styles.tabButton(activeTab === 'rooms')}
            onMouseOver={(e) => {
              if (activeTab !== 'rooms') e.target.style.backgroundColor = '#f0f0f0';
            }}
            onMouseOut={(e) => {
              if (activeTab !== 'rooms') e.target.style.backgroundColor = '#fff';
            }}
          >
            🛏️ จัดการห้อง
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            style={styles.tabButton(activeTab === 'credits')}
            onMouseOver={(e) => {
              if (activeTab !== 'credits') e.target.style.backgroundColor = '#f0f0f0';
            }}
            onMouseOut={(e) => {
              if (activeTab !== 'credits') e.target.style.backgroundColor = '#fff';
            }}
          >
            💳 เครดิตผู้ใช้
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>รายชื่อการจองทั้งหมด</h2>
            <BookingTable bookings={bookings} onCheckin={handleCheckin} onCheckout={handleCheckout} />
            {bookings.length === 0 && (
              <div style={styles.emptyState}>
                <p>✨ ไม่มีการจองในขณะนี้</p>
              </div>
            )}
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div style={styles.tabContent}>
            <div style={styles.roomsSection}>
              <div style={styles.addRoomBox}>
                <h2 style={styles.sectionTitle}>➕ เพิ่มห้องใหม่</h2>
                <AddRoomForm onRoomAdded={() => loadRooms()} />
              </div>

              <div style={styles.roomListBox}>
                <h2 style={styles.sectionTitle}>รายชื่อห้องพัก</h2>
                <RoomList 
                  rooms={rooms} 
                  onRoomUpdated={() => loadRooms()} 
                  onRoomDeleted={() => { loadRooms(); loadBookings(); }}
                />
                {rooms.length === 0 && (
                  <div style={styles.emptyState}>
                    <p>✨ ยังไม่มีห้องใดๆ</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Credit Tab */}
        {activeTab === 'credits' && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>💳 เติมเครดิตผู้ใช้</h2>
            <div style={styles.creditGrid}>
              {users.map((userItem) => (
                <div key={userItem.id} style={styles.creditCard}>
                  <p style={styles.creditUserName}>{userItem.username} ({userItem.role})</p>
                  <p style={styles.creditBalance}>เครดิต: <strong>{userItem.credit ?? 0} บาท</strong></p>
                  <div style={styles.creditRow}>
                    <input
                      type="number"
                      min="1"
                      placeholder="จำนวนเครดิต"
                      value={topUpAmounts[userItem.id] || ''}
                      onChange={(e) => setTopUpAmounts((prev) => ({ ...prev, [userItem.id]: e.target.value }))}
                      style={styles.creditInput}
                    />
                    <button
                      style={styles.creditButton}
                      onClick={() => handleTopUp(userItem.id)}
                    >
                      เติมเครดิต
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div style={styles.emptyState}>
                  <p>✨ ไม่มีผู้ใช้ให้เติมเครดิต</p>
                </div>
              )}
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
  },
  content: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "40px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6b7280",
    margin: 0,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  tabs: {
    display: "flex",
    gap: "12px",
    borderBottom: "2px solid #e5e7eb",
    marginBottom: "30px",
  },
  tabButton: (isActive) => ({
    padding: "12px 24px",
    backgroundColor: isActive ? "#667eea" : "#fff",
    color: isActive ? "#fff" : "#666",
    border: "none",
    borderBottom: isActive ? "3px solid #667eea" : "none",
    borderRadius: isActive ? "8px 8px 0 0" : "8px 8px 0 0",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: isActive ? "600" : "500",
    transition: "all 0.3s ease",
  }),
  tabContent: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "25px",
    margin: "0 0 25px 0",
  },
  roomsSection: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "30px",
  },
  creditGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  creditCard: {
    padding: "25px",
    borderRadius: "18px",
    backgroundColor: "#fff",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5e7eb",
  },
  creditUserName: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },
  creditBalance: {
    margin: "10px 0 18px 0",
    fontSize: "14px",
    color: "#4b5563",
  },
  creditRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  creditInput: {
    flex: 1,
    minWidth: "140px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
  },
  creditButton: {
    padding: "12px 18px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  addRoomBox: {
    backgroundColor: "#f9fafb",
    padding: "30px",
    borderRadius: "12px",
    border: "2px dashed #e5e7eb",
  },
  roomListBox: {
    backgroundColor: "#fff",
  },
  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "18px",
  },
  loadingBox: {
    padding: "60px 20px",
    textAlign: "center",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    color: "#667eea",
    fontSize: "16px",
    marginBottom: "20px",
  },
  errorBox: {
    padding: "20px",
    backgroundColor: "#fee2e2",
    borderRadius: "12px",
    color: "#991b1b",
    fontSize: "16px",
    marginBottom: "20px",
    border: "1px solid #fca5a5",
  },
};
