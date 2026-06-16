import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getRooms, createBooking } from "../api/booking";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import RoomCard from "../components/booking/RoomCard";
import BookingModal from "../components/booking/BookingModal";
import "../styles/customer-booking.css";
import { toast } from "react-toastify";
import { FiRefreshCw } from "react-icons/fi";
import { useTheme }
from "../context/ThemeContext";

export default function CustomerBooking() {
  const { user, token, refreshUser  } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all"); // all | single | double
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
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
  return () => {
    if (topupSlipPreview) {
      URL.revokeObjectURL(topupSlipPreview);
    }
  };
}, [topupSlipPreview]);
  const [searchCheckIn, setSearchCheckIn] = useState("");
  const [searchCheckOut, setSearchCheckOut] = useState("");
  const [searchGuests, setSearchGuests] = useState(1);
  const [activeBookings, setActiveBookings] = useState([]);
  const [appliedSearch, setAppliedSearch] = useState(false);
  const navigate = useNavigate();
  const { darkMode, toggleTheme } =
  useTheme();

  

  useEffect(() => {
    loadRooms();
  }, []);
        useEffect(() => {
        let timer;

        if (bookingSuccess) {
          timer = setTimeout(() => {
            setShowBookingModal(false);
            setBookingSuccess(false);
            loadRooms();
          }, 1500);
        }

        return () => {
          clearTimeout(timer);
        };
      }, [bookingSuccess]);

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
        (room.bed_type === "double" && room.capacity && Number(room.capacity) >= 2)
      );
    }
    return true;
  };

  // ✅ ฟังก์ชันตรวจสอบการแย้งการจอง (ลดโค้ดซ้ำ)
  const checkRoomConflict = (roomId, checkIn = searchCheckIn, checkOut = searchCheckOut) => {
    return (activeBookings || []).some((booking) => {
      if (booking.room_id !== roomId) {
        return false;
      }

      const bookingCheckIn = booking.check_in?.slice(0, 10) || booking.check_in;
      const bookingCheckOut = booking.check_out?.slice(0, 10) || booking.check_out;

      if (!checkIn || !checkOut) {
        const today = new Date().toISOString().split("T")[0];
        return bookingCheckIn <= today && bookingCheckOut > today;
      }

      return bookingCheckIn < checkOut && bookingCheckOut > checkIn;
    });
  };

  const isMyRoomBooking = (room) => {
    return (activeBookings || []).some((booking) => {
      if (booking.room_id !== room.id) return false;
      if (booking.user_id !== user?.id) return false;

      const bookingCheckIn = booking.check_in?.slice(0, 10) || booking.check_in;
      const bookingCheckOut = booking.check_out?.slice(0, 10) || booking.check_out;

      if (!searchCheckIn || !searchCheckOut) {
        const today = new Date().toISOString().split("T")[0];
        return bookingCheckIn <= today && bookingCheckOut > today;
      }

      return bookingCheckIn < searchCheckOut && bookingCheckOut > searchCheckIn;
    });
  };

  const filteredRooms = rooms.filter((room) => {
    const q = searchQuery.trim().toLowerCase();
    const typeText = ((room.room_type || room.type || "") + "").toLowerCase();
    const nameText = (room.name || "").toString().toLowerCase();
    const matchesSearch =
      !q ||
      nameText.includes(q) ||
      typeText.includes(q) ||
      (q.includes("twin") && typeText.includes("twin")) ||
      (q.includes("double") && typeText.includes("double")) ||
      (q.includes("เตียงเดี่ยว") && typeText.includes("เตียงเดี่ยว")) ||
      (q.includes("เตียงคู่") && typeText.includes("เตียงคู่"));
    const capacityMatch = !searchGuests || Number(room.capacity) >= Number(searchGuests);
    const isMyBooking = isMyRoomBooking(room);
    const availableMatch = !checkRoomConflict(room.id);
    const showRoom = isMyBooking || (room.status === 'available' && availableMatch);

    return matchesSearch && matchesCategory(room) && capacityMatch && showRoom;
  });

const loadRooms = async () => {

  try {

    const roomData = await getRooms();

    const bookingRes = await fetch(
      "http://localhost:3000/api/bookings/customer-active",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const bookingData = await bookingRes.json();
    console.log(bookingData);

    setRooms(roomData);

    setActiveBookings(Array.isArray(bookingData) ? bookingData : []);

  } catch (err) {

    console.error('Error loading rooms:', err);

    setRooms([]);
    setActiveBookings([]);

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

    return checkIn.toISOString().split("T")[0];
  };

const calculateNights = (checkIn, checkOut) => {

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);

  const diffTime = outDate - inDate;

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};


  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
    setGuestName("");
    setGuestPhone("");
    setCheckInDate(searchCheckIn || "");
    setCheckOutDate(searchCheckOut || "");
  };

    const handleBooking = async () => {
      setBookingError("");
      if (!guestName || !guestPhone ||  !checkInDate || !checkOutDate || !selectedRoom) {
        setBookingError("กรุณากรอกข้อมูลให้ครบ");
        return;
      }
      if (guestPhone.length !== 10) {
        setBookingError("กรุณากรอกเบอร์โทร 10 หลัก");
        return;
      }

      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        setBookingError("วันเช็คเอาท์ต้องอยู่หลังวันเช็คอิน");
        return;
      }

      const totalPrice =
        selectedRoom.price *
        calculateNights(checkInDate, checkOutDate);

      if ((user?.credit ?? 0) < totalPrice) {
        setBookingError("เครดิตไม่เพียงพอ");
        return;
      }

    setLoading(true);

    try {
      const result = await createBooking({
        guest_name: guestName,
        guest_phone: guestPhone,
        room_id: selectedRoom.id,
        check_in: checkInDate,
        check_out: checkOutDate,
      }
      , token);

      setBookingId(result.id);
      setBookingSuccess(true);

      toast.success("จองสำเร็จ! กำลังเปิดใบเสร็จ...");

      setTimeout(() => {
        window.open(
          `http://localhost:3000/api/receipt/${result.id}`,
          "_blank"
        );
      }, 1000);

      refreshUser();

    } catch (err) {
      setBookingError(err.message || "จองไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

const handleTopUpCredit = async () => {

  if (!creditAmount || !topupSlip) {

    setShowCreditModal(false);

    Swal.fire({
      title: 'ผิดพลาด',
      text: 'กรุณาแนบสลิป',
      icon: 'error',
      confirmButtonColor: '#ef4444',
    });

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

      Swal.fire({
        title: 'สำเร็จ',
        text: 'ส่งคำขอเติมเครดิตแล้ว',
        icon: 'success',
        confirmButtonColor: '#22c55e',
      });

      setShowCreditModal(false);

      setTopupSlip(null);
      setTopupSlipPreview("");

    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'ผิดพลาด',
        text: 'เกิดข้อผิดพลาด',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  return (
    <div className="customer-container">
      <button
  onClick={toggleTheme}
>
  {darkMode
    ? "☀️ Light Mode"
    : "🌙 Dark Mode"}
</button>
      <div className="customer-wrapper">
        <div className="top-bar">
          <div className="header-right">
            <div className="user-card">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="user-card-btn"
                >
                <div className="user-avatar">
                  {(user?.name || user?.role).slice(0,1).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{user?.name || user?.username}</div>
                  <div className="user-credit">เครดิต: <strong>฿{user?.credit ?? 0}</strong></div>
                </div>
                <div className="dropdown-arrow">▼</div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="dropdown-menu">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowCreditModal(true);
                      setShowUserMenu(false);
                    }}
                  >
                    เติมเครดิต
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/topup-history");
                      setShowUserMenu(false);
                    }}
                  >
                    ประวัติเติมเครดิต
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="hero-section">
          <h1 className="hero-title">
            Welcome to RVC Grand Hotel
          </h1>

          <p className="hero-text">
            Discover luxury rooms and premium experiences
          </p>
          <div className="booking-search-bar">
            <div className="search-field">
              <label className="search-label">Check In</label>

              <input
                type="date"
                className="search-input-modern"
                value={searchCheckIn}
                min={getTodayDate()}
                onChange={(e) => {
                  setSearchCheckIn(e.target.value);

                  // reset checkout ถ้าเลือกวันผิด
                  if (
                    searchCheckOut &&
                    new Date(e.target.value) >= new Date(searchCheckOut)
                  ) {
                    setSearchCheckOut("");
                  }
                }}
              />
            </div>

            <div className="search-field">
              <label className="search-label">Check Out</label>

              <input
                type="date"
                className="search-input-modern"
                value={searchCheckOut}
                min={
                  searchCheckIn
                    ? new Date(
                        new Date(searchCheckIn).setDate(
                          new Date(searchCheckIn).getDate() + 1
                        )
                      )
                        .toISOString()
                        .split("T")[0]
                    : getTodayDate()
                }
                onChange={(e) => setSearchCheckOut(e.target.value)}
                disabled={!searchCheckIn}
              />
            </div>

            <div className="search-field">
              <label className="search-label">ประเภทห้อง</label>

              <select
                className="search-input-modern"
                value={searchGuests}
                onChange={(e) => setSearchGuests(Number(e.target.value))}
              >
                <option value={1}>เตียงเดี่ยว</option>
                <option value={2}>เตียงคู่</option>
              </select>
            </div>

            <button
              className="search-main-button"
              onClick={() => {
                if (!searchCheckIn || !searchCheckOut) {
                  alert("กรุณาเลือกวันเข้าพักและวันออก");
                  return;
                }

                setCategory(searchGuests >= 2 ? "double" : "single");
              }}
            >
              Search Rooms
            </button>
              <button
                className="reset-search-button"
                onClick={() => {
                  setSearchCheckIn("");
                  setSearchCheckOut("");
                  setSearchGuests(1);
                  setSearchQuery("");
                  setCategory("all");

                  loadRooms();
                }}
              >
                <FiRefreshCw />
              </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🛏️</div>
            <div>
              <h3 className="stat-number">20</h3>
              <p className="stat-text">ห้องพักคุณภาพ</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div>
              <h3 className="stat-number">4.9</h3>
              <p className="stat-text">คะแนนรีวิว</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🕒</div>
            <div>
              <h3 className="stat-number">24/7</h3>
              <p className="stat-text">บริการตลอดเวลา</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🛡️</div>
            <div>
              <h3 className="stat-number">Secure</h3>
              <p className="stat-text">ระบบปลอดภัย</p>
            </div>
          </div>
        </div>

        <div className="category-bar">
          <button className={ category === "all" ? "category-button active-category-button" : "category-button"} onClick={() => setCategory('all')}>ทั้งหมด</button>
          <button className={ category === "double" ? "category-button active-category-button" : "category-button"} onClick={() => setCategory('double')}>เตียงคู่ (Double)</button>
          <button className={ category === "single" ? "category-button active-category-button" : "category-button"} onClick={() => setCategory('single')}>เตียงเดี่ยว (Twin)</button>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="empty-box">
            <p>🏨 ห้องพักถูกจองเต็มทั้งหมดในช่วงเวลานี้</p>
          </div>
        ) : (
        <div className="rooms-grid">

          {filteredRooms.map((room) => (

            <RoomCard
              key={room.id}
              room={room}
              user={user}
              activeBookings={activeBookings}
              searchCheckIn={searchCheckIn}
              searchCheckOut={searchCheckOut}
              checkRoomConflict={checkRoomConflict}
              handleSelectRoom={handleSelectRoom}
            />

          ))}

        </div>
        )}
      </div>
      {/* Booking Modal */}
      <BookingModal
        showBookingModal={showBookingModal}
        setShowBookingModal={setShowBookingModal}
        selectedRoom={selectedRoom}
        guestName={guestName}
        setGuestName={setGuestName}
        guestPhone={guestPhone}
        setGuestPhone={setGuestPhone}
        checkInDate={checkInDate}
        setCheckInDate={setCheckInDate}
        checkOutDate={checkOutDate}
        setCheckOutDate={setCheckOutDate}
        getTodayDate={getTodayDate}
        getMinCheckOutDate={getMinCheckOutDate}
        calculateNights={calculateNights}
        bookingError={bookingError}
        loading={loading}
        handleBooking={handleBooking}
      />

      {/* Success Modal */}
      {bookingSuccess && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-content">
              <div className="success-icon">✓</div>
              <h2 className="success-title">จองสำเร็จ!</h2>
              <p className="success-message">
                หมายเลขการจอง: <strong>#{bookingId}</strong>
              </p>
              <p className="success-message">
                ห้อง {selectedRoom?.name} - {checkInDate} ถึง {checkOutDate}
              </p>
              <p className="success-hint">กำลังปิดหน้าต่างใน 2 วินาที...</p>
            </div>
          </div>
        </div>
      )}

      {/* Credit Top-up Modal */}
      {showCreditModal && (
        <div className="modal-overlay" onClick={() => setShowCreditModal(false)}>
          <div className="credit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">💳 เติมเครดิต</h2>
              <button
                className="close-button"
                onClick={() => setShowCreditModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="credit-topup-box">
                <p className="topup-title">จำนวนเงินที่ต้องการเติม</p>
                <div className="credit-button-group">
                  {[100, 200, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setCreditAmount(amt)}
                      className={
                        creditAmount === amt
                        ? "credit-amount-btn active"
                        : "credit-amount-btn"
                      }
                    >
                      ฿{amt}
                    </button>
                  ))}
                </div>

                <label className="form-label">หรือกรอกจำนวนเองด้านล่าง</label>
                <input
                  type="number"
                  min="1"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="custom-input"
                />

                <div className="qr-topup-box">
                  <p className="qr-title">
                    สแกน QR พร้อมเพย์
                  </p>

                  <img
                    src="/payment/promptpay-real.jpg"
                    alt="QR พร้อมเพย์"
                    className="promptpay-image"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];

                      if (file) {
                        setTopupSlip(file);
                        const previewUrl = URL.createObjectURL(file);

                        setTopupSlipPreview(previewUrl);
                      }
                    }}
                    className="slip-upload"
                  />

                  {topupSlipPreview && (
                    <img
                      src={topupSlipPreview}
                      alt="Slip Preview"
                      className="slip-preview"
                    />
                  )}
                      <p className="topup-hint">
                    กรุณาโอนตามจำนวนที่เลือก
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setShowCreditModal(false)}
              >
                ยกเลิก
              </button>
              <button
                className="confirm-button"
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
