import { useEffect, useState } from "react";
import { getBookingCalendar } from "../api/admin";
import { useAuth } from "../context/AuthContext";
import "../pages/AdminDashboard.css";

export default function BookingCalendar() {

  const { token } = useAuth();

  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (token) {
      loadCalendar();
    }
  }, [token]);

  const loadCalendar = async () => {

    try {

      const data = await getBookingCalendar(token);

      setBookings(data);

    } catch (err) {

      console.error(err);

    }

  };

  const currentDate = new Date();

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const days = Array.from(
    { length: daysInMonth },
    (_, i) => i + 1
  );

  const rooms = [...new Set(
    bookings.map(b => b.room_name)
  )];

  const isBooked = (roomName, day) => {

    return bookings.some((b) => {

      if (b.room_name !== roomName) return false;

      const checkIn = new Date(b.check_in);
      checkIn.setHours(0, 0, 0, 0);

      const checkOut = new Date(b.check_out);
      checkOut.setHours(0, 0, 0, 0);

      const cellDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );

      cellDate.setHours(0, 0, 0, 0);

      return cellDate >= checkIn &&
        cellDate < checkOut;

    });

  };

  return (

    <div style={{ overflowX: "auto" }}>

      <h3 style={{ marginBottom: "10px" }}>
        เดือน {currentDate.toLocaleString("th-TH", {
          month: "long",
          year: "numeric"
        })}
      </h3>

      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "12px",
          fontWeight: "600",
        }}
      >
        <span>🟩 ว่าง</span>
        <span>🟥 ถูกจอง</span>
      </div>

      <table className="calendar-table">

        <thead>

          <tr>
            <th className="calendar-header">ห้อง</th>

            {days.map(day => (
              <th key={day} className="calendar-header">
                {day}
              </th>
            ))}
          </tr>

        </thead>

        <tbody>

          {rooms.map(room => (

            <tr key={room}>

              <td className="calendar-roomName">
                {room}
              </td>

              {days.map(day => {

                const booked =
                  isBooked(room, day);

                return (
                  <td
                    key={day}
                    className="calendar-cell"
                    style={{
                      backgroundColor:
                        booked
                          ? "#ef4444"
                          : "#22c55e"
                    }}
                  />
                );

              })}

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

