import "../../styles/room-card.css";

export default function RoomCard({
  room,
  activeBookings,
  user,
  searchCheckIn,
  searchCheckOut,
  checkRoomConflict,
  handleSelectRoom
}) {

const myBooking = activeBookings.find((b) => {
  if (b.room_id !== room.id) return false;
  if (b.user_id !== user.id) return false;

  const bookingCheckIn = b.check_in.slice(0, 10);
  const bookingCheckOut = b.check_out.slice(0, 10);

  if (!searchCheckIn || !searchCheckOut) {
    const today = new Date().toISOString().split("T")[0];
    return bookingCheckIn <= today && bookingCheckOut > today;
  }

  return bookingCheckIn < searchCheckOut && bookingCheckOut > searchCheckIn;
});

  const roomAvailable = room.status === 'available' && !checkRoomConflict(room.id);
  const statusLabel = myBooking
    ? '✅ คุณจองห้องนี้แล้ว'
    : room.status === 'available'
    ? '🟢 ว่าง'
    : room.status === 'maintenance'
    ? '🟠 ปิดปรับปรุง'
    : room.status === 'cleaning'
    ? '🟡 ทำความสะอาด'
    : room.status === 'unavailable'
    ? '🔴 ไม่พร้อมใช้งาน'
    : '🔴 ไม่ว่าง';

  return (
    <div className="room-card">

      <img
        src={
          room.image ||
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
        }
        alt={room.name}
        className="room-image"
      />

      <div className="room-info">

        <h3 className="room-name">
          ห้องที่ {room.name}
        </h3>

        <p className="room-type">
          {room.room_type}
        </p>

        <div className="amenities-box">
          <span>บริการอาหารเช้า</span>
        </div>

        <p className="room-status">
          สถานะ: {statusLabel}
        </p>

        <p className="room-capacity">
          👥 ความจุ: {room.capacity} คน
        </p>

        <div className="price-box">
          <span className="price">
            ฿{room.price}
          </span>

          <span className="price-label">
            บาท/คืน
          </span>
        </div>

        <button
          className={
            myBooking
              ? "disabled-button"
              : roomAvailable
              ? "book-button"
              : "disabled-button"
          }
          disabled={!!myBooking || !roomAvailable}
          onClick={() => roomAvailable && !myBooking && handleSelectRoom(room)}
        >
          {myBooking
            ? "✅ คุณจองห้องนี้แล้ว"
            : roomAvailable
            ? " จองห้อง"
            : " ไม่ว่าง"}
        </button>

      </div>
    </div>
  );
}