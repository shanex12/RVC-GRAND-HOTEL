
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

export const createBooking = async (data, token) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API}/bookings`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    const responseData = await res.json();
    
    if (!res.ok) {
      throw new Error(responseData.error || "จองไม่สำเร็จ");
    }
    
    return responseData;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
};

