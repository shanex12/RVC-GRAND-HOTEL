export default function BookingTable({ bookings = [], onCheckout, onCheckin }) {
  if (!Array.isArray(bookings) || bookings.length === 0) {
    return <p style={{ color: '#999' }}>ไม่มีการจองในขณะนี้</p>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('th-TH');
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>👤 ชื่อผู้เข้าพัก</th>
              <th style={styles.th}>📞 โทรศัพท์</th>
              <th style={styles.th}>🛏️ ห้อง</th>
              <th style={styles.th}>📋 ประเภท</th>
              <th style={styles.th}>📅 วันที่เข้าพัก</th>
              <th style={styles.th}>📅 วันที่ออกพัก</th>
              <th style={styles.th}>🏷️ สถานะ</th>
              <th style={styles.th}>⚙️ จัดการ</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b, idx) => (
              <tr 
                key={b.id} 
                style={{
                  ...styles.bodyRow,
                  backgroundColor: idx % 2 === 0 ? "#f9fafb" : "#fff",
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f4ff"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#f9fafb" : "#fff"}
              >
                <td style={styles.td}><strong>{b.guest_name}</strong></td>
                <td style={styles.td}><a href={`tel:${b.guest_phone}`}>{b.guest_phone || '-'}</a></td>
                <td style={styles.td}>{b.room_number || b.room_id}</td>
                <td style={styles.td}>{b.room_type || '-'}</td>
                <td style={styles.td}>{formatDate(b.check_in)}</td>
                <td style={styles.td}>{formatDate(b.check_out)}</td>
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
                        ? "✅ เช็คอินเแล้ว"
                        : "✔ เช็คเอาท์แล้ว"
                    }
                  </span>
                </td>
                <td style={styles.td}>
                    {
                      b.status === "booked" && (
                        <button style={styles.btnCheckin} onClick={() => onCheckin(b.id)}>
                          Check-in
                        </button>
                      )
                    }

                    {
                      b.status === "checked_in" && (
                        <button style={styles.btnCheckout} onClick={() => onCheckout(b.id)}>
                          Check-out
                        </button>
                      )
                    }
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
  bodyRow: {
    transition: "background-color 0.2s ease",
  },
  td: {
    padding: "16px 12px",
    borderBottom: "1px solid #e5e7eb",
  },
  badge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
  },
  btnCheckin: {
    padding: "10px 18px",
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    transition: "all 0.25s ease",
    boxShadow: "0 6px 16px rgba(34,197,94,0.25)",
  },
  btnCheckout: {
    padding: "10px 18px",
    background: "linear-gradient(135deg,#ef4444,#dc2626)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    transition: "all 0.25s ease",
    boxShadow: "0 6px 16px rgba(239,68,68,0.25)",
  },
};
