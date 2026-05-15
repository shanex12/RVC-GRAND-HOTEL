import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getActiveBookings, checkoutBooking, checkinBooking, getAllRooms, getUsers, topUpCredit } from '../api/admin';
import StatCard from '../components/StatCard';
import BookingTable from '../components/BookingTable';
import AddRoomForm from '../components/AddRoomForm';
import RoomList from '../components/RoomList';
import BookingHistory  from '../components/BookingHistory';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { getDashboardStats } from '../api/admin';


export default function AdminDashboard() {
  const [topups, setTopups] = useState([]);
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [topUpAmounts, setTopUpAmounts] = useState({});
  const [showMagicCredit, setShowMagicCredit] = useState(false);
  const [magicUsername, setMagicUsername] = useState("");
  const [magicAmount, setMagicAmount] = useState("");
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
  usedCredit: 0,
  monthRevenue: 0,
  availableRooms: 0,
  checkedIn: 0,
});


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
        await Promise.all([loadBookings(), loadRooms(), loadUsers(), loadTopups(), loadDashboardStats()]);
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

  const result = await Swal.fire({
    title: 'ยืนยันเช็คอิน?',
    text: 'ต้องการเช็คอินลูกค้าคนนี้หรือไม่',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#22c55e',
    cancelButtonColor: '#6b7280',
  });

  if (!result.isConfirmed) return;

  try {

    await checkinBooking(id);

    await Swal.fire({
      title: 'สำเร็จ',
      text: 'เช็คอินเรียบร้อยแล้ว',
      icon: 'success',
      confirmButtonColor: '#22c55e',
    });

    loadBookings();
    loadRooms();

  } catch (err) {

    Swal.fire({
      title: 'ผิดพลาด',
      text: 'เช็คอินไม่สำเร็จ',
      icon: 'error',
      confirmButtonColor: '#ef4444',
    });

  }
};

const handleCheckout = async (id) => {

  const result = await Swal.fire({
    title: 'ยืนยันเช็คเอาท์?',
    text: 'เมื่อลูกค้าเช็คเอาท์แล้ว ห้องจะว่างและพร้อมให้จองต่อไป ต้องการเช็คเอาท์ลูกค้าคนนี้หรือไม่',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'เช็คเอาท์',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
  });

  if (!result.isConfirmed) return;

  try {

    await checkoutBooking(id);

    Swal.fire({
      title: 'สำเร็จ',
      text: 'เช็คเอาท์เรียบร้อย',
      icon: 'success',
      confirmButtonColor: '#22c55e',
    });

    loadBookings();
    loadRooms();

  } catch (err) {

    Swal.fire({
      title: 'ผิดพลาด',
      text: 'เช็คเอาท์ไม่สำเร็จ',
      icon: 'error',
      confirmButtonColor: '#ef4444',
    });

  }
};

  const handleTopUp = async (userId) => {
    const amount = Number(topUpAmounts[userId] || 0);
    if (!amount || amount <= 0) {
      toast.error('กรุณาระบุจำนวนเครดิตที่ต้องการเติม');
      return;
    }
    try {
      await topUpCredit(userId, amount, token);
      toast.success('เติมเครดิตสำเร็จ ✨');
      setTopUpAmounts((prev) => ({ ...prev, [userId]: '' }));
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'เติมเครดิตไม่สำเร็จ');
    }
  };

  const loadTopups = async () => {

  const res = await fetch(
    "http://localhost:3000/api/topups"
  );

  const data = await res.json();

  setTopups(data);
};

  const handleMagicCredit = async () => {

    if (!magicUsername || !magicAmount) {
      toast.error("กรอกข้อมูลให้ครบ");
      return;
    }

    try {

      const foundUser = users.find(
        (u) =>
          u.username.toLowerCase() ===
          magicUsername.toLowerCase()
      );

      if (!foundUser) {
        toast.error("ไม่พบ username");
        return;
      }

      await topUpCredit(
        foundUser.id,
        Number(magicAmount),
        token
      );

      Swal.fire({
        title: 'สำเร็จ',
        text: 'เติมเครดิตสำเร็จ',
        icon: 'success',
        confirmButtonColor: '#22c55e',
      });

      setMagicUsername("");
      setMagicAmount("");
      setShowMagicCredit(false);

      loadUsers();

    } catch (err) {

      Swal.fire({
        title: 'ผิดพลาด',
        text: err.message || 'เติมเครดิตไม่สำเร็จ',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });

    }
  };

  const loadDashboardStats = async () => {

  try {

    const data = await getDashboardStats();

    setStats(data);

  } catch (err) {

    console.error(err);

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
            title="รายได้วันนี้"
            value={`฿${Number(stats.usedCredit || 0).toLocaleString()}`}
            icon="💰"
            color="#22c55e"
          />

          <StatCard
            title="รายได้เดือนนี้"
            value={`฿${Number(stats.monthRevenue).toLocaleString()}`}
            icon="📅"
            color="#3b82f6"
          />

          <StatCard
            title="ห้องว่าง"
            value={stats.availableRooms}
            icon="🛏️"
            color="#f59e0b"
          />

          <StatCard
            title="ลูกค้าเข้าพัก"
            value={stats.checkedIn}
            icon="👥"
            color="#8b5cf6"
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
            onClick={() => setActiveTab('topups')}
            style={styles.tabButton(activeTab === 'topups')}
          >
            💰 เติมเครดิต ({topups.filter(t => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('bookingshistory')}
            style={styles.tabButton(activeTab === 'bookingshistory')}
          >
            🕒 ประวัติการจอง
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
        
        {/*History Tab */}
        {activeTab === 'bookingshistory' && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>ประวัติการจอง</h2>
            <BookingHistory />
          </div>
        )}

        {/* Credits Tab */}
        {activeTab === 'topups' && (

          <div style={styles.tabContent}>

            <div style={styles.topupHeader}>
            <h2>รายการเติมเครดิต</h2>

            <button
              style={styles.magicBtn}
              onClick={() => setShowMagicCredit(true)}
            >
              ✨ เสกเครดิต
            </button>
            {showMagicCredit && (

            <div style={styles.popupOverlay}>

              <div style={styles.popupBox}>

                <h2 style={styles.popupTitle}>
                  ✨ เพิ่มเครดิต
                </h2>

                <input
                  type="text"
                  placeholder="Username"
                  value={magicUsername}
                  onChange={(e) =>
                    setMagicUsername(e.target.value)
                  }
                  style={styles.popupInput}
                />

                <input
                  type="number"
                  placeholder="จำนวนเครดิต"
                  value={magicAmount}
                  onChange={(e) =>
                    setMagicAmount(e.target.value)
                  }
                  style={styles.popupInput}
                />

                <div style={styles.popupActions}>

                  <button
                    style={styles.cancelPopupBtn}
                    onClick={() =>
                      setShowMagicCredit(false)
                    }
                  >
                    ยกเลิก
                  </button>

                  <button
                    style={styles.confirmPopupBtn}
                    onClick={handleMagicCredit}
                  >
                    ยืนยัน
                  </button>

                </div>

              </div>

            </div>

          )}
          </div>

            <div style={styles.topupGrid}>

              {topups.map((item) => (

                <div
                  key={item.id}
                  style={styles.topupCard}
                >

                  <h3>User : {item.username}</h3>

                  <p>฿{item.amount}</p>

                  <p>
                    สถานะ:
                    {item.status}
                  </p>

                  <img
                    src={`http://localhost:3000/uploads/${item.slip_image}`}
                    alt="slip"
                    style={styles.slipImage}
                  />

                  {item.status !== 'approved' && (

          <div style={styles.actionButtons}>

            {item.status !== 'approved' && (

              <button
                style={styles.approveBtn}
                onClick={async () => {

                  await fetch(
                    `http://localhost:3000/api/topups/${item.id}/approve`,
                    {
                      method: "PUT",
                    }
                  );

                  loadTopups();
                  loadUsers();

                }}
              >
                ✅ อนุมัติ
              </button>

            )}

            <button
              style={styles.deleteBtn}
              onClick={async () => {

                const result = await Swal.fire({
                  title: 'ยืนยันการลบ?',
                  text: 'สลิปนี้จะถูกลบถาวร',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'ลบ',
                  cancelButtonText: 'ยกเลิก',
                  confirmButtonColor: '#ef4444',
                  cancelButtonColor: '#6b7280',
                });

                if (!result.isConfirmed) return;

                try {

                  await fetch(
                    `http://localhost:3000/api/topups/${item.id}`,
                    {
                      method: "DELETE",
                    }
                  );

                  Swal.fire({
                    title: 'สำเร็จ',
                    text: 'ลบสลิปเรียบร้อย',
                    icon: 'success',
                  });

                  loadTopups();

                } catch (err) {

                  Swal.fire({
                    title: 'ผิดพลาด',
                    text: 'ลบสลิปไม่สำเร็จ',
                    icon: 'error',
                  });

                }

              }}
            >
              🗑 ลบ
            </button>

          </div>
                    

                  )}

                </div>

              ))}

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
  topupGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    gap: "20px",
  },

  topupCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  slipImage: {
    width: "100%",
    maxHeight: "300px",
    objectFit: "contain",
    borderRadius: "12px",
    marginTop: "10px",
  },
  topupHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
},

magicBtn: {
  padding: "12px 20px",
  border: "none",
  borderRadius: "12px",
  background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "15px",
  boxShadow: "0 10px 25px rgba(99,102,241,0.25)",
},

popupOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
},

popupBox: {
  width: "400px",
  background: "#fff",
  borderRadius: "20px",
  padding: "30px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
},

popupTitle: {
  margin: 0,
  fontSize: "28px",
  fontWeight: "800",
  color: "#111827",
  textAlign: "center",
},

popupInput: {
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
  outline: "none",
},

popupActions: {
  display: "flex",
  gap: "12px",
  marginTop: "10px",
},

cancelPopupBtn: {
  flex: 1,
  padding: "14px",
  border: "none",
  borderRadius: "12px",
  background: "#e5e7eb",
  color: "#111827",
  fontWeight: "700",
  cursor: "pointer",
},

confirmPopupBtn: {
  flex: 1,
  padding: "14px",
  border: "none",
  borderRadius: "12px",
  background: "linear-gradient(135deg,#10b981,#059669)",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
},
actionButtons: {
  display: "flex",
  gap: "10px",
  marginTop: "15px",
},
approveBtn: {
  flex: 1,
  padding: "12px",
  border: "none",
  borderRadius: "12px",
  background: "linear-gradient(135deg,#22c55e,#16a34a)",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
},

deleteBtn: {
  flex: 1,
  padding: "12px",
  border: "none",
  borderRadius: "12px",
  background: "linear-gradient(135deg,#ef4444,#dc2626)",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
},
};
