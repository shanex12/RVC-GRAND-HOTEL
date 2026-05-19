
const API = 'http://localhost:3000/api';

export async function getBookings() {
  const res = await fetch(`${API}/bookings`);
  return res.json();
}

export async function checkIn(id) {
  return fetch(`${API}/bookings/${id}/checkin`, {
    method: 'PUT'
  });
}

export async function checkOut(id) {
  return fetch(`${API}/bookings/${id}/checkout`, {
    method: 'PUT'
  });
}
export const getRooms = async () => {
  const res = await fetch(`${API}/rooms`);
  if (!res.ok) throw new Error("โหลดห้องไม่สำเร็จ");
  return await res.json();
};

export const createBooking = async (bookingData, token) => {
  const res = await fetch("http://localhost:3000/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  });

  const data = await res.json();

  if (!res.ok) {
    console.log(data);
    throw new Error(data.error || "Booking failed");
  }

  return data;
};
