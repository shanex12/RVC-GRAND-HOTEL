import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getRooms, createBooking } from "../api/booking";

export default function CustomerBooking() {
  const { user, token, refreshUser } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all"); // all | single | double
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingId, setBookingId] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState(100);
  const [topupSlip, setTopupSlip] = useState(null);
  const [topupSlipPreview, setTopupSlipPreview] = useState("");

  useEffect(() => {
    loadRooms();
  }, []);

  const matchesCategory = (room) => {
    if (!category || category === "all") return true;
    const typeText = ((room.room_type || room.type || "") + "").toLowerCase();
    if (category === "single") {
      return (
        typeText.includes("twin") ||
        typeText.includes("single") ||
        typeText.includes("เตียงเดี่ยว") ||
        (!typeText.includes("double") && (room.capacity === 1 || room.capacity === '1'))
      );
    }
    if (category === "double") {
      return (
        typeText.includes("double") ||
        typeText.includes("เตียงคู่") ||
        typeText.includes("คู่") ||
        (room.capacity && Number(room.capacity) >= 2)
      );
    }
    return true;
  };

  const filteredRooms = rooms.filter((room) => {
    const q = searchQuery.trim().toLowerCase();
    const typeText = ((room.room_type || room.type || "") + "").toLowerCase();
    const nameText = (room.name || "").toString().toLowerCase();
    const matchesSearch =
      !q ||
      nameText.includes(q) ||
      typeText.includes(q) ||
      q.includes("twin") && typeText.includes("twin") ||
      q.includes("double") && typeText.includes("double") ||
      q.includes("เตียงเดี่ยว") && typeText.includes("เตียงเดี่ยว") ||
      q.includes("เตียงคู่") && typeText.includes("เตียงคู่");
    return matchesSearch && matchesCategory(room);
  });

  const loadRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Error loading rooms:', err);
      setRooms([]);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinCheckOutDate = () => {
    if (!checkInDate) return getTodayDate();
    const checkIn = new Date(checkInDate);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn.toISOString().split('T')[0];
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
    setGuestName("");
    setCheckInDate("");
    setCheckOutDate("");
  };

    const handleBooking = async () => {
      setBookingError("");
      if (!guestName || !checkInDate || !checkOutDate || !selectedRoom) {
        setBookingError("กรุณากรอกข้อมูลให้ครบ");
        return;
      }

      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        setBookingError("วันเช็คเอาท์ต้องอยู่หลังวันเช็คอิน");
        return;
      }

    setLoading(true);

    try {
      const result = await createBooking({
        guest_name: guestName,
        room_id: selectedRoom.id,
        check_in: checkInDate,
        check_out: checkOutDate,
      });

      setBookingId(result.id);
      setBookingSuccess(true);

      refreshUser();

      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
        loadRooms();
      }, 1500);

    } catch (err) {
      setBookingError(err.message || "จองไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleTopUpCredit = async () => {

    if (!creditAmount || !topupSlip) {
      alert("กรุณาแนบสลิป");
      return;
    }

  try {

      const formData = new FormData();

      formData.append("amount", creditAmount);
      formData.append("slip", topupSlip);

      const res = await fetch(
        "http://localhost:3000/api/topups",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "เติมเครดิตไม่สำเร็จ");
        return;
      }

      alert("ส่งคำขอเติมเครดิตแล้ว");

      setShowCreditModal(false);

      setTopupSlip(null);
      setTopupSlipPreview("");

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.topBar}>
          <div style={styles.headerRight}>
            <div style={{...styles.userCard, position: 'relative'}}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{...styles.userCardBtn}}>
                <div style={styles.userAvatar}>{(user?.name || user?.role).slice(0,1).toUpperCase()}</div>
                <div style={styles.userInfo}>
                  <div style={styles.userName}>{user?.name || user?.username}</div>
                  <div style={styles.userCredit}>เครดิต: <strong>฿{user?.credit ?? 0}</strong></div>
                </div>
                <div style={styles.dropdownArrow}>▼</div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div style={styles.dropdownMenu}>
                  <button
                    style={styles.dropdownItem}
                    onClick={() => {
                      setShowCreditModal(true);
                      setShowUserMenu(false);
                    }}
                  >
                    💳 เติมเครดิต
                  </button>
                  <button style={{...styles.dropdownItem, borderTop: '1px solid #e0f2fe'}}>
                    👤 โปรไฟล์
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={styles.categoryBar}>
          <button style={category === 'all' ? {...styles.categoryButton, ...styles.activeCategoryButton} : styles.categoryButton} onClick={() => setCategory('all')}>ทั้งหมด</button>
          <button style={category === 'double' ? {...styles.categoryButton, ...styles.activeCategoryButton} : styles.categoryButton} onClick={() => setCategory('double')}>เตียงคู่ (Double)</button>
          <button style={category === 'single' ? {...styles.categoryButton, ...styles.activeCategoryButton} : styles.categoryButton} onClick={() => setCategory('single')}>เตียงเดี่ยว (Twin)</button>
        </div>

        {filteredRooms.length === 0 ? (
          <div style={styles.emptyBox}>
            <p>❌ ไม่พบห้องตามการค้นหาหรือหมวดหมู่</p>
          </div>
        ) : (
          <div style={styles.roomsGrid}>
            {filteredRooms.map((room) => (
              <div 
                key={room.id} 
                style={styles.roomCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.15)";
                  e.currentTarget.style.borderColor = "#d4af37";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.08)";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <div style={styles.roomImage}>
                  {((room.room_type || room.type || "").toLowerCase().includes('double') || (room.room_type || room.type || "").toLowerCase().includes('คู่')) ? '👥' : '👤'}
                </div>
                <div style={styles.roomInfo}>
                  <h3 style={styles.roomName}>ห้องที่ {room.name}</h3>
                  <p style={styles.roomType}>{room.room_type}</p>
                  <div style={styles.amenitiesBox}>
                    <span style={styles.amenityIcon} title="อาหารเช้า">🍳</span>
                    <span style={styles.amenityText}>บริการอาหารเช้า</span>
                  </div>
                  <p style={styles.roomStatus}>สถานะ: {room.status === 'available' ? '🟢 ว่าง' : '🔴 ไม่ว่าง'}</p>
                  <p style={styles.roomCapacity}>👥 ความจุ: {room.capacity} คน</p>
                  <div style={styles.priceBox}>
                    <span style={styles.price}>฿{room.price}</span>
                    <span style={styles.priceLabel}>บาท/คืน</span>
                  </div>
                  <button
                    style={room.status === 'available' ? styles.bookButton : styles.disabledButton}
                    onClick={() => room.status === 'available' && handleSelectRoom(room)}
                    disabled={room.status !== 'available'}
                    onMouseOver={(e) => {
                      if (room.status === 'available') {
                        e.currentTarget.style.backgroundColor = "#2d2d2d";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (room.status === 'available') {
                        e.currentTarget.style.backgroundColor = "#1a1a1a";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {room.status === 'available' ? '💳 จองห้อง' : '🚫 ไม่ว่าง'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <div style={styles.modalOverlay} onClick={() => setShowBookingModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                📋 ยืนยันการจองห้องที่ {selectedRoom.name}
              </h2>
              <button
                style={styles.closeButton}
                onClick={() => setShowBookingModal(false)}
                onMouseOver={(e) => e.currentTarget.style.color = "#333"}
                onMouseOut={(e) => e.currentTarget.style.color = "#999"}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.roomDetailBox}>
                <p><strong>ประเภทห้อง:</strong> {selectedRoom.room_type}</p>
                <p><strong>ความจุ:</strong> {selectedRoom.capacity} คน</p>
                <p><strong>ราคา:</strong> ฿{selectedRoom.price}/คืน</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>👤 ชื่อผู้เข้าพัก</label>
                <input
                  style={styles.input}
                  placeholder="กรุณากรอกชื่อของคุณ"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>

              </div>

              <div style={styles.dateGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>📅 วันเข้าพัก</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={getTodayDate()}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>📅 วันเช็คเอาท์</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={getMinCheckOutDate()}
                  />
                </div>
              </div>

              {checkInDate && checkOutDate && (
                <div style={styles.summaryBox}>
                  <p>
                    <strong>ระยะเวลาพัก:</strong> {new Date(checkOutDate).getDate() - new Date(checkInDate).getDate()} คืน
                  </p>
                  <p>
                    <strong>ราคารวม:</strong> ฿{selectedRoom.price * (new Date(checkOutDate).getDate() - new Date(checkInDate).getDate())}
                  </p>
                </div>
              )}
            </div>

            {bookingError && (
              <div style={styles.errorBox}>
                <span style={styles.errorText}>❌ {bookingError}</span>
              </div>
            )}

            <div style={styles.modalFooter}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowBookingModal(false)}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e5e7eb"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
              >
                ✕ ยกเลิก
              </button>
              <button
                style={styles.confirmButton}
                onClick={handleBooking}
                disabled={loading}
                onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = "#2d2d2d")}
                onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = "#1a1a1a")}
              >
                {loading ? "⏳ กำลังจอง..." : "✓ ยืนยันการจอง"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {bookingSuccess && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modal, ...styles.successModal}}>
            <div style={styles.successContent}>
              <div style={styles.successIcon}>✓</div>
              <h2 style={styles.successTitle}>จองสำเร็จ!</h2>
              <p style={styles.successMessage}>
                หมายเลขการจอง: <strong>#{bookingId}</strong>
              </p>
              <p style={styles.successMessage}>
                ห้อง {selectedRoom?.name} - {checkInDate} ถึง {checkOutDate}
              </p>
              <p style={styles.successHint}>กำลังปิดหน้าต่างใน 2 วินาที...</p>
            </div>
          </div>
        </div>
      )}

      {/* Credit Top-up Modal */}
      {showCreditModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreditModal(false)}>
          <div style={{...styles.modal}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>💳 เติมเครดิต</h2>
              <button
                style={styles.closeButton}
                onClick={() => setShowCreditModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.creditTopupBox}>
                <p style={{margin: '0 0 10px 0', color: '#0f172a', fontWeight: 700}}>จำนวนเงินที่ต้องการเติม</p>
                <div style={{display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap'}}>
                  {[100, 200, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setCreditAmount(amt)}
                      style={{
                        ...styles.creditAmountBtn,
                        ...(creditAmount === amt ? styles.creditAmountBtnActive : {})
                      }}
                    >
                      ฿{amt}
                    </button>
                  ))}
                </div>

                <label style={styles.label}>หรือกรอกจำนวนเองด้านล่าง</label>
                <input
                  type="number"
                  min="1"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  style={styles.input}
                />

                <div style={styles.qrTopupBox}>
                  <p
                    style={{
                      margin: '0 0 12px 0',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#0f172a'
                    }}
                  >
                    สแกน QR พร้อมเพย์
                  </p>

                  <img
                    src="/payment/promptpay-real.jpg"
                    alt="QR พร้อมเพย์"
                    style={{
                      width: '220px',
                      borderRadius: '12px',
                      border: '1px solid #ccc',
                      objectFit: 'cover'
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];

                      if (file) {
                        setTopupSlip(file);
                        setTopupSlipPreview(URL.createObjectURL(file));
                      }
                    }}
                    style={{ marginTop: "15px" }}
                  />

                  {topupSlipPreview && (
                    <img
                      src={topupSlipPreview}
                      alt="Slip Preview"
                      style={{
                        width: "100%",
                        maxWidth: "220px",
                        maxHeight: "250px",
                        marginTop: "12px",
                        borderRadius: "12px",
                        border: "1px solid #ccc",
                        objectFit: "contain",
                      }}
                    />
                  )}
                  <p
                    style={{
                      marginTop: '12px',
                      fontSize: '13px',
                      color: '#64748b'
                    }}
                  >
                    กรุณาโอนตามจำนวนที่เลือก
                  </p>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowCreditModal(false)}
              >
                ยกเลิก
              </button>
              <button
                style={styles.confirmButton}
                onClick={handleTopUpCredit}
                disabled={loading}
              >
                {loading ? "⏳ กำลังดำเนินการ..." : `✓ ยืนยันเติม ฿${creditAmount}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    margin: 0,
    padding: 0,
    backgroundColor: "#f8f7f4",
  },
  wrapper: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "100px 24px 24px",
  },
  header: {
    textAlign: "center",
    marginBottom: "50px",
    paddingTop: "20px",
  },
  title: {
    fontSize: "42px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 10px 0",
    letterSpacing: "1px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#075985",
    margin: 0,
  },
  roomsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "30px",
    marginBottom: "40px",
  },
  roomCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 18px 50px rgba(2,6,23,0.06)",
    transition: "transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
    border: "1px solid rgba(14,165,233,0.12)",
    cursor: "pointer",
  },
  roomImage: {
    width: "100%",
    height: "200px",
    background: "linear-gradient(135deg,#7dd3fc 0%,#60a5fa 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "80px",
  },
  roomInfo: {
    padding: "25px",
  },
  roomName: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  roomType: {
    fontSize: "14px",
    color: "#0369a1",
    fontWeight: "700",
    margin: "0 0 12px 0",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  paymentOptionBox: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '10px',
  },
  paymentOption: {
    padding: '10px 18px',
    borderRadius: '999px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  paymentOptionActive: {
    backgroundColor: 'linear-gradient(90deg,#e0f2fe,#f0f9ff)',
    borderColor: '#7dd3fc',
    color: '#0369a1',
  },
  creditInfo: {
    marginTop: '12px',
    padding: '14px',
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
    border: '1px solid #bfdbfe',
    color: '#075985',
    fontSize: '14px',
  },
  creditNote: {
    margin: '6px 0 0 0',
    fontSize: '13px',
    color: '#4b5563',
  },
  qrBox: {
    marginTop: '16px',
    padding: '15px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
  },
  qrLabel: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#111827',
  },
  qrImage: {
    width: '220px',
    height: '220px',
    borderRadius: '16px',
    marginBottom: '12px',
    border: '1px solid #d1d5db',
  },
  qrHint: {
    margin: 0,
    fontSize: '13px',
    color: '#6b7280',
  },
  roomCapacity: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 12px 0",
  },
  roomStatus: {
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 12px 0",
  },
  priceBox: {
    background: 'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(14,165,233,0.02) 100%)',
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
    textAlign: "center",
    border: "1px solid rgba(14,165,233,0.12)",
  },
  price: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0369a1",
  },
  priceLabel: {
    fontSize: "12px",
    color: "#666",
    marginLeft: "5px",
  },
  bookButton: {
    width: "100%",
    padding: "14px",
    background: 'linear-gradient(90deg,#0369a1,#0ea5e9)',
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    transition: "transform 0.18s ease, box-shadow 0.2s ease",
    boxShadow: '0 10px 30px rgba(14,165,233,0.12)'
  },
  disabledButton: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#ccc",
    color: "#666",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "not-allowed",
  },
  emptyBox: {
    padding: "40px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    textAlign: "center",
    color: "#666",
    fontSize: "18px",
    border: "1px solid rgba(14,165,233,0.12)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflow: "auto",
    border: "1px solid rgba(212,175,55,0.2)",
    },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    overflowY: "auto",
    padding: "20px",
  },
  modal: {
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    backgroundColor: "#fff",
    borderRadius: "16px",
  },
  modalHeader: {
    center: "center",
    padding: "25px",
    borderBottom: "2px solid rgba(212,175,55,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(90deg, #fff 0%, rgba(212,175,55,0.02) 100%)",
  },
  modalTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: 0,
    flex: 1,
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#999",
    transition: "color 0.2s ease",
  },
  modalBody: {
    padding: "25px",
  },
  roomDetailBox: {
    backgroundColor: "rgba(14,165,233,0.06)",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "22px",
    borderLeft: "4px solid rgba(14,165,233,0.9)",
  },
  headerLeft: {
    textAlign: 'left',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'linear-gradient(180deg, rgba(239,246,255,0.9), rgba(235,248,255,0.8))',
    padding: '8px 12px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(2,6,23,0.06)',
    border: '1px solid rgba(14,165,233,0.12)'
  },
  userAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '999px',
    background: 'linear-gradient(135deg,#60a5fa,#06b6d4)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '18px',
    boxShadow: '0 6px 18px rgba(6,95,70,0.06)'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontWeight: 700,
    color: '#0f172a'
  },
  userCredit: {
    fontSize: '13px',
    color: '#0369a1'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    padding: '8px 10px',
    fontSize: '14px',
    minWidth: '220px',
    background: 'transparent',
  },
  searchBtn: {
    marginLeft: '8px',
    background: 'linear-gradient(90deg,#0ea5e9,#0891b2)',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 700
  },
  categoryBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  categoryButton: {
    padding: '8px 14px',
    borderRadius: '999px',
    border: '1px solid rgba(2,6,23,0.06)',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 700,
    color: '#0f172a',
  },
  activeCategoryButton: {
    background: 'linear-gradient(90deg,#e0f2fe,#f0f9ff)',
    border: '1px solid #7dd3fc',
    color: '#0369a1',
    boxShadow: '0 10px 30px rgba(14,165,233,0.08)',
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
  },
  label: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "12px 14px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "15px",
    backgroundColor: "#fafafa",
    fontFamily: "inherit",
    transition: "border-color 0.3s ease",
  },
  dateGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
  summaryBox: {
    backgroundColor: "#d1fae5",
    padding: "15px",
    borderRadius: "10px",
    color: "#065f46",
    fontSize: "14px",
    borderLeft: "4px solid #10b981",
  },
  modalFooter: {
    padding: "20px 25px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: "12px",
  },
  cancelButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#f3f4f6",
    color: "#333",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  confirmButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  amenitiesBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 0 12px 0",
    background: "#fffbe6",
    borderRadius: "8px",
    padding: "6px 12px",
    border: "1px solid #ffe58f",
    width: "fit-content",
    fontWeight: 600,
    fontSize: "14px",
    color: "#b8860b",
    boxShadow: "0 2px 8px rgba(255, 215, 0, 0.08)",
  },
  amenityIcon: {
    fontSize: "18px",
    marginRight: "2px",
  },
  amenityText: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#b8860b",
    letterSpacing: "0.5px",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #fecaca",
    marginBottom: "15px",
  },
  errorText: {
    color: "#991b1b",
    fontSize: "14px",
    fontWeight: "600",
  },
  successModal: {
    maxWidth: "400px",
    backgroundColor: "#ecfdf5",
    borderLeftWidth: "6px",
    borderLeftStyle: "solid",
    borderLeftColor: "#10b981",
  },
  successContent: {
    textAlign: "center",
    padding: "40px 30px",
  },
  successIcon: {
    fontSize: "60px",
    color: "#10b981",
    marginBottom: "15px",
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#065f46",
    margin: "0 0 15px 0",
  },
  successMessage: {
    fontSize: "15px",
    color: "#047857",
    margin: "8px 0",
  },
  successHint: {
    fontSize: "13px",
    color: "#059669",
    fontStyle: "italic",
    marginTop: "15px",
  },
  userCardBtn: {
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    padding: 0,
  },
  dropdownArrow: {
    fontSize: '12px',
    color: '#0369a1',
    fontWeight: 700,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: '#fff',
    border: '1px solid #bfdbfe',
    borderRadius: '10px',
    boxShadow: '0 18px 50px rgba(2,6,23,0.1)',
    minWidth: '180px',
    zIndex: 1001,
  },
  dropdownItem: {
    width: '100%',
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    color: '#0f172a',
    transition: 'background 0.2s',
  },
  creditTopupBox: {
    padding: '15px',
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
    border: '1px solid #bfdbfe',
  },
  creditAmountBtn: {
    padding: '8px 14px',
    borderRadius: '10px',
    border: '2px solid #e0f2fe',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 700,
    color: '#0369a1',
    transition: 'all 0.2s',
  },
  creditAmountBtnActive: {
    background: 'linear-gradient(90deg,#0369a1,#0ea5e9)',
    border: '2px solid #0369a1',
    color: '#fff',
  },
  qrTopupBox: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: '#f0f9ff',
    borderRadius: '10px',
    border: '1px solid #bfdbfe',
    textAlign: 'center',
  },
  topBar: {
  position: "fixed",
  top: "20px",
  right: "30px",
  zIndex: 999,
  },
};