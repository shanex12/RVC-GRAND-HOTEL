import { useState } from 'react';

export default function AddRoomForm({ onRoomAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    room_type: '',
    capacity: '',
    price: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.room_type || !formData.capacity || !formData.price) {
      alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          room_type: formData.room_type,
          capacity: parseInt(formData.capacity),
          price: parseFloat(formData.price),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'สร้างห้องไม่สำเร็จ');
        return;
      }

      alert('ห้องถูกสร้างสำเร็จ!');
      setFormData({ name: '', room_type: '', capacity: '', price: '' });
      setShowForm(false);
      
      if (onRoomAdded) {
        onRoomAdded();
      }
    } catch (err) {
      console.error('Error:', err);
      alert('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button 
        onClick={() => setShowForm(true)}
        style={styles.toggleBtn}
        onMouseOver={(e) => e.target.style.backgroundColor = "#059669"}
        onMouseOut={(e) => e.target.style.backgroundColor = "#10b981"}
      >
        ➕ เพิ่มห้องใหม่
      </button>
    );
  }

  return (
    <div style={styles.formContainer}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>📍 เลขห้อง</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="เช่น 101, 102, ..."
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>🏨 ประเภทห้อง</label>
          <select
            name="room_type"
            value={formData.room_type}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="">-- เลือกประเภท --</option>
            <option value="TWIN ROOM">TWIN ROOM</option>
            <option value="DOUBLE ROOM">DOUBLE ROOM</option>
          </select>
        </div>

        <div style={styles.grid2}>
          <div style={styles.formGroup}>
            <label style={styles.label}>👥 ความจุ (คน)</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="เช่น 2"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>💰 ราคา (บาท/คืน)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="เช่น 1200"
              step="100"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button 
            type="submit"
            disabled={loading}
            style={styles.submitBtn}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = "#059669")}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = "#10b981")}
          >
            {loading ? '⏳ กำลังสร้าง...' : '✓ สร้างห้อง'}
          </button>
          <button 
            type="button"
            onClick={() => setShowForm(false)}
            style={styles.cancelBtn}
            onMouseOver={(e) => e.target.style.backgroundColor = "#6b7280"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#9ca3af"}
          >
            ✕ ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  toggleBtn: {
    padding: "12px 24px",
    backgroundColor: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "background-color 0.2s ease",
  },
  formContainer: {
    backgroundColor: "#f9fafb",
    padding: "30px",
    borderRadius: "12px",
    border: "2px dashed #e5e7eb",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  label: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "12px 14px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "15px",
    backgroundColor: "#fff",
    transition: "border-color 0.2s ease",
    fontFamily: "inherit",
  },
  select: {
    padding: "12px 14px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "15px",
    backgroundColor: "#fff",
    cursor: "pointer",
    transition: "border-color 0.2s ease",
    fontFamily: "inherit",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "10px",
  },
  submitBtn: {
    padding: "12px 24px",
    backgroundColor: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "background-color 0.2s ease",
    flex: 1,
  },
  cancelBtn: {
    padding: "12px 24px",
    backgroundColor: "#9ca3af",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "background-color 0.2s ease",
    flex: 1,
  },
};
