export default function BookingTable({ bookings = [], onCheckout, onCheckin }) {
  if (!Array.isArray(bookings) || bookings.length === 0) {
    return <p style={{ color: '#999' }}>ไม่มีการจองในขณะนี้</p>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>👤 ชื่อผู้เข้าพัก</th>
              <th style={styles.th}>🛏️ ห้อง</th>
              <th style={styles.th}>📋 ประเภท</th>
              <th style={styles.th}>📅 เข้าพัก</th>
              <th style={styles.th}>📅 ออกพัก</th>
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
                <td style={styles.td}>{b.room_number || b.room_id}</td>
                <td style={styles.td}>{b.room_type || '-'}</td>
                <td style={styles.td}>{formatDate(b.check_in)}</td>
                <td style={styles.td}>{formatDate(b.check_out)}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: b.status === 'checked_in' ? '#d1fae5' : '#fef3c7',
                    color: b.status === 'checked_in' ? '#065f46' : '#92400e',
                  }}>
                    {b.status === 'booked' ? '⏳ ยังไม่เข้าพัก' : '✓ เข้าพัก'}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionGroup}>
                    {b.status === "booked" && onCheckin && (
                      <button 
                        onClick={() => onCheckin(b.id)}
                        style={styles.btnCheckin}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#059669"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#10b981"}
                      >
                        Check-in
                      </button>
                    )}
                    {b.status === "checked_in" && onCheckout && (
                      <button 
                        onClick={() => onCheckout(b.id)}
                        style={styles.btnCheckout}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
                      >
                        Check-out
                      </button>
                    )}
                  </div>
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
  actionGroup: {
    display: "flex",
    gap: "8px",
  },
  btnCheckin: {
    padding: "8px 16px",
    backgroundColor: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  },
  btnCheckout: {
    padding: "8px 16px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  },
};
