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

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const rooms = [...new Set(
    bookings.map(b => b.room_name)
  )];

  const isBooked = (roomName, day) => {

    return bookings.some((b) => {

      if (b.room_name !== roomName) return false;

      const checkIn = new Date(b.check_in).getDate();
      const checkOut = new Date(b.check_out).getDate();

      return day >= checkIn && day < checkOut;

    });

  };

  return (

    <div style={{ overflowX: "auto" }}>

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

