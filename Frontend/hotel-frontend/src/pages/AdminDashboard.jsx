import { useEffect, useState } from 'react';
import {
  getActiveBookings,
  getAllRooms,
  checkinBooking,
  checkoutBooking,
  getDashboardStats,
  getUsers,
} from "../api/admin";
import "./AdminDashboard.css";
import AddRoomForm from '../components/AddRoomForm';
import RoomList from '../components/RoomList';
import BookingHistory  from '../components/BookingHistory';
import Swal from 'sweetalert2';
import { useAuth } from "../context/AuthContext";
import BookingCalendar from '../components/BookingCalendar';
import DashboardStats from "../components/dashboard/DashboardStats";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import BookingTab from "../components/dashboard/BookingTab";
import TopupsTab from "../components/dashboard/TopupsTab";
import LogsTab from "../components/dashboard/LogsTab";


export default function AdminDashboard() {
  const { user, token } = useAuth();
  const isStaff = user?.role === "staff";
  const [topups, setTopups] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    usedCredit: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    availableRooms: 0,
    checkedIn: 0,
  });
const revenueData = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;

  const monthBookings = bookings.filter((b) => {
    const date = b.created_at
      ? new Date(b.created_at)
      : null;

    return date && date.getMonth() + 1 === month;
  });

  const revenue = monthBookings.reduce(
    (sum, b) => sum + Number(b.total_price || 0),
    0
  );

  return {
    month: new Date(0, i).toLocaleString("th-TH", {
      month: "short",
    }),
    revenue,
  };
});

const bookingStatusData = [

  {
    name: "Booked",
    value: bookings.filter(
      (b) => b.status === "booked"
    ).length,
  },

  {
    name: "Checked In",
    value: bookings.filter(
      (b) => b.status === "checked_in"
    ).length,
  },

  {
    name: "Checked Out",
    value: bookings.filter(
      (b) => b.status === "checked_out"
    ).length,
  },

  {
    name: "Cancelled",
    value: bookings.filter(
      (b) => b.status === "cancelled"
    ).length,
  },

];

const roomTypes = {};

rooms.forEach((room) => {

  const type = room.room_type || "Unknown";

  roomTypes[type] =
    (roomTypes[type] || 0) + 1;

});

const roomData = Object.entries(roomTypes).map(
  ([room, count]) => ({
    room,
    count,
  })
);
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadBookings = async () => {
    try {
      const data = await getActiveBookings(token);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setBookings([]);
    }
  };

  const loadRooms = async () => {
    try {
      const data = await getAllRooms(token);
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading rooms:', err);
      setRooms([]);
    }
  };

  const loadUsers = async () => {
      if (!token) return;
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
        const tasks = [
        loadBookings(),
        loadRooms(),
        loadTopups(),
        loadDashboardStats(),
      ];

      if (!isStaff) {
        tasks.push(loadUsers());
        tasks.push(loadLogs());
      }

      await Promise.all(tasks);
      } catch (err) {
        console.error('Dashboard init error:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
}, [token, isStaff]);

useEffect(() => {

  const newNotifications = [];

topups
  .filter(t => t.status === "pending")
  .forEach(t => {
    newNotifications.push({
      id: `topup-${t.id}`,
      message: `มีคำขอเติมเครดิตจาก ${t.username}`,
      time: t.created_at
        ? new Date(t.created_at)
        : new Date(),
      read: false,
    });
  });

  bookings
    .filter(b => b.status === "booked")
    .forEach(b => {
      newNotifications.push({
        id: `booking-${b.id}`,
        message: `มีการจองใหม่ ห้อง ${b.room_number}`,
        time: b.created_at
          ? new Date(b.created_at)
          : new Date(),
        read: false,
      });
    });

  setNotifications(newNotifications);

}, [topups, bookings]);

const filteredBookings = bookings.filter((booking) => {

  const keyword = search.toLowerCase();

  const matchesSearch =
    booking.guest_name?.toLowerCase().includes(keyword)
    ||
    booking.guest_phone?.includes(keyword)
    ||
    booking.room_number?.toLowerCase().includes(keyword);

  const matchesStatus =
    statusFilter === "all"
    ||
    booking.status === statusFilter;

  return matchesSearch && matchesStatus;

});

const totalPages = Math.max(
  1,
  Math.ceil(
    filteredBookings.length / bookingsPerPage
  )
);

const startIndex =
  (currentPage - 1) * bookingsPerPage;

const paginatedBookings =
  filteredBookings.slice(
    startIndex,
    startIndex + bookingsPerPage
  );

useEffect(() => {
  setCurrentPage(1);
}, [search, statusFilter]);

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

    await checkinBooking(id, token);

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

    await checkoutBooking(id, token);

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


const loadTopups = async () => {

  try {
      if (!token) {
        setTopups([]);
        return;
      }

      const res = await fetch(
        "http://localhost:3000/api/topups",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setTopups(Array.isArray(data) ? data : []);

    } catch (err) {

      console.error(err);

      setTopups([]);

    }

};

  const loadLogs = async () => {

  try {
      if (!token) {
        setLogs([]);
        return;
      }

    const res = await fetch(
      'http://localhost:3000/api/activity-logs',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setLogs(Array.isArray(data) ? data : []);

  } catch (err) {

    console.error(err);

  }
};

  const loadDashboardStats = async () => {

  try {
    const data = await getDashboardStats(token);

    setStats(data);

  } catch (err) {

    console.error(err);

  }

};

  return (
    <div className="admin-container">
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">🏨 Admin Dashboard</h1>
          <p className="admin-subtitle">จัดการการจองและห้องพักของคุณ</p>
        </div>

 <div className="notification-bell"
        onClick={() =>
          setShowNotifications(!showNotifications)
        }
      >
        🔔 {notifications.filter(n => !n.read).length}
      </div>

{showNotifications && (
        <div className="notification-panel">

          {notifications.map((n) => (

            <div
              key={n.id}
              style={{
                padding: "12px",
                borderBottom: "1px solid #eee",
              }}
            >
              <div>{n.message}</div>

              <small>
                {n.time.toLocaleTimeString()}
              </small>
            </div>

          ))}

        </div>
        )}

        {loading && (
          <div className="loading-box">
            <p>⏳ กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {error && (
          <div className="error-box">
            <p>❌ {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
          <DashboardStats stats={stats} />
          <DashboardCharts
            revenueData={revenueData}
            bookingStatusData={bookingStatusData}
            roomData={roomData}
          />    

        {/* Tabs */}
        <div className="tabs">
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
          onClick={() => setActiveTab('calendar')}
          style={styles.tabButton(activeTab === 'calendar')}
        >
          📅 ปฏิทินห้อง
        </button>
          {!isStaff && (
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
          )}
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
          {!isStaff && (
          <button
            onClick={() => setActiveTab('logs')}
            style={styles.tabButton(activeTab === 'logs')}
          >
            📜 ประวัติการทำรายการแอดมิน
          </button>
          )}
          
        </div>

        {activeTab === "bookings" && (
          <BookingTab
            paginatedBookings={paginatedBookings}
            bookings={bookings}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            handleCheckin={handleCheckin}
            handleCheckout={handleCheckout}
          />
        )}
        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="tab-content">
            <h2 className="section-title">
              📅 ปฏิทินการจองห้อง
            </h2>

            <BookingCalendar />
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && !isStaff && (
          <div className="tab-content">
            <div className="rooms-section">
              <div className="add-room-box">
                <h2 className="section-title">➕ เพิ่มห้องใหม่</h2>
                <AddRoomForm onRoomAdded={() => loadRooms()} />
              </div>

              <div className="room-list-box">
                <h2 className="section-title">รายชื่อห้องพัก</h2>
                <RoomList 
                  rooms={rooms} 
                  token={token}
                  onRoomUpdated={() => loadRooms()} 
                  onRoomDeleted={() => { loadRooms(); loadBookings(); }}
                />
                {rooms.length === 0 && (
                  <div className="empty-state">
                    <p>✨ ยังไม่มีห้องใดๆ</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/*History Tab */}
        {activeTab === 'bookingshistory' && (
          <div className="tab-content">
            <h2 className="section-title">ประวัติการจอง</h2>
            <BookingHistory />
          </div>
        )}
        {/* Topups Tab */}
        {activeTab === "topups" && (
          <TopupsTab
            topups={topups}
            token={token}
            loadTopups={loadTopups}
            loadUsers={loadUsers}
          />
        )}
        {/* Logs Tab */}
        {activeTab === "logs" && !isStaff && (
          <LogsTab logs={logs} />
        )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {

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

};
