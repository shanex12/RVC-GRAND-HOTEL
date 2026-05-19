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
export async function checkinBooking(id) {
  try {
    const res = await fetch(`${API_URL}/bookings/${id}/checkin`, {
      method: 'PUT'
    });
    if (!res.ok) throw new Error('Checkin failed');
    return await res.json();
  } catch (err) {
    console.error('Checkin error:', err);
    throw err;
  }
}

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
export async function getBookingHistory() {

  const res = await fetch(
    'http://localhost:3000/api/bookings/history'
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'โหลดประวัติไม่สำเร็จ');
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