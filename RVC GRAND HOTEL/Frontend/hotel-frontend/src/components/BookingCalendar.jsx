import { useEffect, useState } from "react";
import { getBookingCalendar } from "../api/admin";
import { useAuth } from "../context/AuthContext";

export default function BookingCalendar() {

  const { token } = useAuth();

  const [bookings, setBookings] = useState([]);

  useEffect(() => {

    loadCalendar();

  }, []);

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

      <table style={styles.table}>

        <thead>

          <tr>
            <th style={styles.header}>ห้อง</th>

            {days.map(day => (
              <th key={day} style={styles.header}>
                {day}
              </th>
            ))}
          </tr>

        </thead>

        <tbody>

          {rooms.map(room => (

            <tr key={room}>

              <td style={styles.roomName}>
                {room}
              </td>

              {days.map(day => {

                const booked =
                  isBooked(room, day);

                return (
                  <td
                    key={day}
                    style={{
                      ...styles.cell,
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

const styles = {

  table: {
    borderCollapse: "collapse",
    width: "100%",
  },

  header: {
    border: "1px solid #ddd",
    padding: "8px",
    background: "#111827",
    color: "#fff",
    fontSize: "13px",
  },

  roomName: {
    border: "1px solid #ddd",
    padding: "8px",
    fontWeight: "700",
    background: "#f3f4f6",
  },

  cell: {
    width: "28px",
    height: "28px",
    border: "1px solid #fff",
  }

};