const API_URL = 'http://localhost:3000/api';

// ดึงการจองทั้งหมด (booked + checked_in)
export async function getActiveBookings() {
  try {
    const res = await fetch(`${API_URL}/bookings/active`);
    if (!res.ok) {
      console.error('Error:', res.status, res.statusText);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error('Fetch error:', err);
    return [];
  }
}

// ดึงห้องทั้งหมด
export async function getAllRooms() {
  try {
    const res = await fetch(`${API_URL}/rooms`);
    if (!res.ok) {
      console.error('Error:', res.status, res.statusText);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error('Fetch error:', err);
    return [];
  }
}

// เช็คอิน
export const checkinBooking = async (id, token) => {

  const res = await fetch(
    `http://localhost:3000/api/bookings/${id}/checkin`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Checkin failed");
  }

  return data;
};

// เช็กเอาท์
export async function checkoutBooking(id) {
  try {
    const res = await fetch(`${API_URL}/bookings/${id}/checkout`, {
      method: 'PUT'
    });
    if (!res.ok) throw new Error('Checkout failed');
    return await res.json();
  } catch (err) {
    console.error('Checkout error:', err);
    throw err;
  }
}

export async function getUsers(token) {
  try {
    const res = await fetch(`${API_URL}/auth/users`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Fetch users failed');
    return await res.json();
  } catch (err) {
    console.error('Fetch users error:', err);
    return [];
  }
}
/* ฟังก์ชันเติมเครดิต */
export const topUpCredit = async (
  userId,
  amount,
  token
) => {

  const res = await fetch(
    "http://localhost:3000/api/topups/magic",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        amount,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || "เติมเครดิตไม่สำเร็จ"
    );
  }

  return data;
};
/* ประวัติการจอง*/
export async function getBookingHistory(token) {

  const res = await fetch(
    'http://localhost:3000/api/bookings/history',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}
/* สถิติแดชบอร์ด */
export const getDashboardStats = async () => {

  const res = await fetch(
    "http://localhost:3000/api/dashboard/stats"
  );

  return await res.json();

};
export async function getBookingCalendar(token) {

  const res = await fetch(
    'http://localhost:3000/api/bookings/calendar',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    throw new Error('โหลด calendar ไม่สำเร็จ');
  }

  return res.json();
}