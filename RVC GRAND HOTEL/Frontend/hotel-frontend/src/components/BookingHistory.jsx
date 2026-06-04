import { useEffect, useState } from "react";
import { getBookingHistory } from "../api/admin";
import { useAuth } from "../context/AuthContext";
import "../pages/AdminDashboard.css";


export default function BookingHistory() {

  const [totalPages, setTotalPages] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');

  const { token } = useAuth();

  const [bookings, setBookings] = useState([]);

  useEffect(() => {

    loadHistory();

  }, [page, search]);

  const loadHistory = async () => {

    try {

      const data = await getBookingHistory(
        token,
        page,
        10,
        search
      );

      setBookings(data.data);
      setTotalPages(data.totalPages);

    } catch (err) {

      console.error(err);

    }
  };

  const formatDate = (dateString) => {

    if (!dateString) return '-';

    const date = new Date(dateString);

    return date.toLocaleDateString(
      'th-TH',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    );
  };

const formatDateTime = (dateString, type, status) => {
  if (status === 'cancelled') {
    return '❌ ยกเลิกแล้ว';
  }

  if (!dateString) {
    return type === "checkin"
      ? "⏳ ยังไม่เช็คอิน"
      : "⏳ ยังไม่เช็คเอาท์";
  }

  const date = new Date(dateString);
  return date.toLocaleString('th-TH');
};
  
  if (bookings.length === 0) {
    return <p>ไม่มีประวัติการจอง</p>;
  }

  return (

    <div className="admin-content">

        <input
          type="text"
          placeholder="ค้นหาชื่อ เบอร์ ห้อง"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            padding: "10px",
            marginBottom: "20px",
            width: "300px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      <div className="tableContainer">
        <table className="booking-table">

        <thead>

          <tr>

            <th>ชื่อ</th>
            <th>เบอร์</th>
            <th>ห้อง</th>
            <th>วันที่จอง</th>
            <th>วัน/เวลาเช็คอิน</th>
            <th>วัน/เวลาเช็คเอาท์</th>
            <th>สถานะ</th>

          </tr>

        </thead>

        <tbody>

          {bookings.map((b) => (
        

            <tr key={b.id} className="booking-table-row">

                <td>{b.guest_name}</td>
                <td>{b.guest_phone}</td>
                <td>{b.room_number || b.room_id}</td>
                <td>{formatDate(b.check_in)}</td>
                <td>{formatDateTime(b.checked_in_at, "checkin", b.status)}</td>
                <td>{formatDateTime(b.checked_out_at, "checkout", b.status)}</td>
                <td>
                    <span
                      className={`status-badge ${
                        b.status === "booked"
                          ? "status-booked"
                          : b.status === "checked_in"
                          ? "status-checkedin"
                          : b.status === "checked_out"
                          ? "status-checkedout"
                          : b.status === "cancelled"
                          ? "status-cancelled"
                          : ""
                      }`}
                    >
                    {
                      b.status === "booked"
                        ? "⏳ ยังไม่เข้าพัก"
                        : b.status === "checked_in"
                        ? "✅ เข็คอินแล้ว"
                        : b.status === "checked_out"
                        ? "✔ เช็คเอาท์แล้ว"
                        : b.status === "cancelled"
                        ? "❌ ยกเลิกแล้ว"
                        : b.status
                    }
                  </span>
                </td>
            </tr>

          ))}

        </tbody>

            </table>
            <div className="pagination">

                <button
                className="page-button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  ◀ ก่อนหน้า
                </button>

                <span className="page-text">
                  หน้า {page} / {totalPages}
                </span>

                <button
                className="page-button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  ถัดไป ▶
                </button>

              </div>
        </div>
    </div>

  );
}
