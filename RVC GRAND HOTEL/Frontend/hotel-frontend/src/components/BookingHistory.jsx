import { useEffect, useState } from "react";
import { getBookingHistory } from "../api/admin";

export default function BookingHistory() {

  const [bookings, setBookings] = useState([]);

  useEffect(() => {

    loadHistory();

  }, []);

  const loadHistory = async () => {

    try {

      const data = await getBookingHistory();

      setBookings(data);

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

  const formatDateTime = (dateString) => {

    if (!dateString) return '-';

    const date = new Date(dateString);

    return date.toLocaleString('th-TH');
  };

  if (bookings.length === 0) {
    return <p>ไม่มีประวัติการจอง</p>;
  }

  return (

    <div style={styles.wrapper}>
      <div style={styles.tableContainer}>
        <table style={styles.table}>

        <thead>

          <tr style={styles.headerRow}>

            <th style={styles.th}>ชื่อ</th>
            <th style={styles.th}>เบอร์</th>
            <th style={styles.th}>ห้อง</th>
            <th style={styles.th}>วันที่จอง</th>
            <th style={styles.th}>วัน/เวลาเช็คอิน</th>
            <th style={styles.th}>วัน/เวลาเช็คเอาท์</th>
            <th style={styles.th}>สถานะ</th>

          </tr>

        </thead>

        <tbody>

          {bookings.map((b) => (
        

            <tr key={b.id} style={styles.bodyRow}>

                <td style={styles.td}>{b.guest_name}</td>
                <td style={styles.td}>{b.guest_phone}</td>
                <td style={styles.td}>{b.room_number || b.room_id}</td>
                <td style={styles.td}>{formatDate(b.check_in)}</td>
                <td style={styles.td}>{formatDateTime(b.status === 'checked_in' ? b.check_in : b.check_out)}</td>
                <td style={styles.td}>{formatDateTime(b.status === 'checked_out' ? b.check_out : '-')}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    background:
                    b.status === 'booked'
                        ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                        : b.status === 'checked_in'
                        ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                        : 'linear-gradient(135deg,#ef4444,#dc2626)',

                    color: '#fff',

                    boxShadow:
                    b.status === 'booked'
                        ? '0 6px 16px rgba(245,158,11,0.25)'
                        : b.status === 'checked_in'
                        ? '0 6px 16px rgba(34,197,94,0.25)'
                        : '0 6px 16px rgba(239,68,68,0.25)',
                  }}>
                    {
                      b.status === "booked"
                        ? "⏳ ยังไม่เข้าพัก"
                        : b.status === "checked_in"
                        ? "✅ เข็คอินแล้ว"
                        : "✔ เช็คเอาท์แล้ว"
                    }
                  </span>
                </td>
            </tr>

          ))}

        </tbody>

            </table>
        </div>
    </div>

  );
}

const styles = {

  wrapper: {
    overflowX: "auto",
  },
    tableContainer: {
    minWidth: "100%",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  headerRow: {
    backgroundColor: "#667eea",
    color: "#fff",
  },

  th: {
    padding: "16px 12px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "14px",
  },

  td: {
    padding: "16px 12px",
    borderBottom: "1px solid #e5e7eb",
  },
    bodyRow: {
    transition: "background-color 0.2s ease",
  },
    badge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
  },

};