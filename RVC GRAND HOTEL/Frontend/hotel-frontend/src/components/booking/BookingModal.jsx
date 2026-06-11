import "../../styles/BookingModal.css";
import { useState } from "react";
import ConfirmBookingModal from "./ConfirmBookingModal";
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
  const [showConfirm, setShowConfirm] =
    useState(false);

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
            รายละเอียดการจองห้องที่ {selectedRoom.name}
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
            onClick={() => setShowConfirm(true)}

            disabled={loading}
          >
            {loading
              ? "⏳ กำลังจอง..."
              : "✓ ยืนยัน"}
          </button>
        </div>
      </div>
                <ConfirmBookingModal
            show={showConfirm}
            room={selectedRoom}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            nights={calculateNights(
              checkInDate,
              checkOutDate
            )}
            totalPrice={
              selectedRoom.price *
              calculateNights(
                checkInDate,
                checkOutDate
              )
            }
            onClose={() =>
              setShowConfirm(false)
            }
            onConfirm={() => {
              setShowConfirm(false);
              handleBooking();
            }}
          />
    </div>
  );
}