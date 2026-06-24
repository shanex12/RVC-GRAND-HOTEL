import { useState } from 'react';

export default function RoomList({ rooms = [], onRoomUpdated, onRoomDeleted, token }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleEditClick = (room) => {
    setEditingId(room.id);
    setEditData({
      name: room.name,
      room_type: room.room_type,
      capacity: room.capacity,
      price: room.price,
      status: room.status,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (id) => {
    if (!editData.name || !editData.room_type || !editData.capacity || !editData.price) {
      alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    setLoading(true);
    try {
      const authToken = token || localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const res = await fetch(`/api/rooms/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: editData.name,
          room_type: editData.room_type,
          capacity: parseInt(editData.capacity),
          price: parseFloat(editData.price),
          status: editData.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'แก้ไขห้องไม่สำเร็จ');
        return;
      }

      alert('แก้ไขห้องสำเร็จ!');
      setEditingId(null);
      setEditData({});
      if (onRoomUpdated) onRoomUpdated();
    } catch (err) {
      console.error('Error:', err);
      alert('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('ยืนยันการลบห้องนี้?')) return;

    setLoading(true);
    try {
      const authToken = token || localStorage.getItem('token');
      const headers = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      const res = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'ลบห้องไม่สำเร็จ');
        return;
      }

      alert('ลบห้องสำเร็จ!');
      if (onRoomDeleted) onRoomDeleted();
    } catch (err) {
      console.error('Error:', err);
      alert('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  if (rooms.length === 0) {
    return <p style={{ color: '#999' }}>ไม่มีห้องในระบบ</p>;
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>🛏️ เลขห้อง</th>
              <th style={styles.th}>📋 ประเภท</th>
              <th style={styles.th}>👥 ความจุ</th>
              <th style={styles.th}>💰 ราคา/คืน</th>
              <th style={styles.th}>🏷️ สถานะ</th>
              <th style={styles.th}>⚙️ จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room, idx) => (
              <tr 
                key={room.id}
                style={{
                  ...styles.bodyRow,
                  backgroundColor: idx % 2 === 0 ? "#f9fafb" : "#fff",
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f4ff"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#f9fafb" : "#fff"}
              >
                {editingId === room.id ? (
                  <>
                    <td style={styles.td}>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        style={styles.inputField}
                      />
                    </td>
                    <td style={styles.td}>
                      <select
                        value={editData.room_type}
                        onChange={(e) => setEditData({ ...editData, room_type: e.target.value })}
                        style={styles.inputField}
                      >
                        <option value="TWIN ROOM">TWIN ROOM</option>
                        <option value="DOUBLE ROOM">DOUBLE ROOM</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <input
                        type="number"
                        value={editData.capacity}
                        onChange={(e) => setEditData({ ...editData, capacity: e.target.value })}
                        style={styles.inputField}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="number"
                        value={editData.price}
                        onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                        style={styles.inputField}
                      />
                    </td>
                    <td style={styles.td}>
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        style={styles.inputField}
                      >
                        <option value="available">available (ว่าง)</option>
                        <option value="maintenance">maintenance (ปิดปรับปรุง)</option>
                        <option value="cleaning">cleaning (ทำความสะอาด)</option>
                        <option value="unavailable">unavailable (ไม่พร้อมใช้งาน)</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button
                          onClick={() => handleSaveEdit(room.id)}
                          disabled={loading}
                          style={styles.btnSave}
                          onMouseOver={(e) => !loading && (e.target.style.backgroundColor = "#059669")}
                          onMouseOut={(e) => !loading && (e.target.style.backgroundColor = "#10b981")}
                        >
                          ✓ บันทึก
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={styles.btnCancel}
                          onMouseOver={(e) => e.target.style.backgroundColor = "#6b7280"}
                          onMouseOut={(e) => e.target.style.backgroundColor = "#9ca3af"}
                        >
                          ✕ ยกเลิก
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={styles.td}><strong>{room.name}</strong></td>
                    <td style={styles.td}>{room.room_type}</td>
                    <td style={styles.td}>{room.capacity} คน</td>
                    <td style={styles.td}>฿{room.price}</td>
                    <td style={styles.td}>
                      {(() => {
                        const displayStatus = room.current_status || room.status;
                        const badgeStyles = {
                          ...styles.badge,
                          backgroundColor:
                            displayStatus === 'available'
                              ? '#d1fae5'
                              : displayStatus === 'maintenance'
                              ? '#fcd34d'
                              : displayStatus === 'cleaning'
                              ? '#fef3c7'
                              : displayStatus === 'booked'
                              ? '#fee2e2'
                              : '#e5e7eb',
                          color:
                            displayStatus === 'available'
                              ? '#065f46'
                              : displayStatus === 'maintenance'
                              ? '#92400e'
                              : displayStatus === 'cleaning'
                              ? '#92400e'
                              : displayStatus === 'booked'
                              ? '#991b1b'
                              : '#111827',
                        };
                        const label =
                          displayStatus === 'available'
                            ? '✓ ว่าง'
                            : displayStatus === 'maintenance'
                            ? '🟠 ปิดปรับปรุง'
                            : displayStatus === 'cleaning'
                            ? '🟡 ทำความสะอาด'
                            : displayStatus === 'booked'
                            ? '✗ มีคนเข้าพักอยู่'
                            : '✗ ไม่พร้อมใช้งาน';
                        return <span style={badgeStyles}>{label}</span>;
                      })()}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button
                          onClick={() => handleEditClick(room)}
                          style={styles.btnEdit}
                          onMouseOver={(e) => e.target.style.backgroundColor = "#1e40af"}
                          onMouseOut={(e) => e.target.style.backgroundColor = "#2563eb"}
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          style={styles.btnDelete}
                          onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
                          onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
                        >
                          🗑️ ลบ
                        </button>
                      </div>
                    </td>
                  </>
                )}
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
  inputField: {
    width: "100%",
    padding: "8px 10px",
    border: "2px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
    fontFamily: "inherit",
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
    flexWrap: "wrap",
  },
  btnEdit: {
    padding: "8px 14px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
    whiteSpace: "nowrap",
  },
  btnDelete: {
    padding: "8px 14px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
    whiteSpace: "nowrap",
  },
  btnSave: {
    padding: "8px 14px",
    backgroundColor: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
    whiteSpace: "nowrap",
  },
  btnCancel: {
    padding: "8px 14px",
    backgroundColor: "#9ca3af",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
    whiteSpace: "nowrap",
  },
};
