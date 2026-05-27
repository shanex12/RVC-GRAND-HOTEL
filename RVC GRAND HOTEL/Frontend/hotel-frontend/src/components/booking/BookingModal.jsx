import "../../styles/BookingModal.css";
export default function BookingModal({
  selectedRoom,
  showBookingModal,
  setShowBookingModal,
  guestName,
  setGuestName,
  guestPhone,
  setGuestPhone,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  bookingError,
  handleBooking,
  loading,
  calculateNights,
  getTodayDate,
  getMinCheckOutDate,
}) {
  if (!showBookingModal || !selectedRoom) {
    return null;
  }

  return (
    <div
      className="booking-modal-overlay"
      onClick={() => setShowBookingModal(false)}
    >
      <div
        className="booking-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="booking-modal-header">
          <h2 className="booking-modal-title">
            ยืนยันการจองห้องที่ {selectedRoom.name}
          </h2>

          <button
            className="booking-modal-close-button"
            onClick={() => setShowBookingModal(false)}
          >
            ✕
          </button>
        </div>

        <div className="booking-modal-body">
          <div className="room-detail-box">
            <p>
              <strong>ประเภทห้อง:</strong>
              {selectedRoom.room_type}
            </p>

            <p>
              <strong>ความจุ:</strong>
              {selectedRoom.capacity} คน
            </p>

            <p>
              <strong>ราคา:</strong>
              ฿{selectedRoom.price}/คืน
            </p>
          </div>

          <div className="form-group">
            <label className="label">
              👤 ชื่อผู้เข้าพัก
            </label>

            <input
              className="input"
              placeholder="กรุณากรอกชื่อของคุณ"
              value={guestName}
              onChange={(e) =>
                setGuestName(e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label className="label">
              เบอร์โทรติดต่อ
            </label>

            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className="input"
              placeholder="กรุณากรอกเบอร์โทรศัพท์"
              value={guestPhone}
              onChange={(e) => {
                const onlyNums =
                  e.target.value.replace(/\D/g, "");

                setGuestPhone(onlyNums);
              }}
            />
          </div>

          <div className="date-grid">
            <div className="form-group">
              <label className="label">
                📅 วันเข้าพัก
              </label>

              <input
                type="date"
                className="input"
                value={checkInDate}
                onChange={(e) =>
                  setCheckInDate(e.target.value)
                }
                min={getTodayDate()}
              />
            </div>

            <div className="form-group">
              <label className="label">
                📅 วันเช็คเอาท์
              </label>

              <input
                type="date"
                className="input"
                value={checkOutDate}
                onChange={(e) =>
                  setCheckOutDate(e.target.value)
                }
                min={getMinCheckOutDate()}
              />
            </div>
          </div>

          {checkInDate && checkOutDate && (
            <div className="summary-box">
              <p>
                <strong>ระยะเวลาพัก:</strong>
                {" "}
                {calculateNights(
                  checkInDate,
                  checkOutDate
                )} คืน
              </p>

              <p>
                <strong>ราคารวม:</strong>
                ฿
                {selectedRoom.price *
                  calculateNights(
                    checkInDate,
                    checkOutDate
                  )}
              </p>
            </div>
          )}
        </div>

        {bookingError && (
          <div className="error-box">
            <span className="error-text">
              ❌ {bookingError}
            </span>
          </div>
        )}

        <div className="booking-modal-footer">
          <button
            className="cancel-button"
            onClick={() =>
              setShowBookingModal(false)
            }
          >
            ✕ ยกเลิก
          </button>

          <button
            className="confirm-button"
            onClick={handleBooking}
            disabled={loading}
          >
            {loading
              ? "⏳ กำลังจอง..."
              : "✓ ยืนยันการจอง"}
          </button>
        </div>
      </div>
    </div>
  );
}