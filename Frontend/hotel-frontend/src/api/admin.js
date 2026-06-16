const API_URL = "http://localhost:3000/api";

// ดึงการจองทั้งหมด
export async function getActiveBookings(token) {
  try {
    const res = await fetch(`${API_URL}/bookings/active`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Error:", res.status, res.statusText);
      return [];
    }

    return await res.json();

  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}

// ดึงห้องทั้งหมด
export async function getAllRooms(token) {
  try {
    const res = await fetch(`${API_URL}/rooms`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Error:", res.status, res.statusText);
      return [];
    }

    return await res.json();

  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}

// เช็คอิน
export async function checkinBooking(id, token) {

  const res = await fetch(
    `${API_URL}/bookings/${id}/checkin`,
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
}
export async function getBookingCalendar(token) {
  const res = await fetch(`${API_URL}/bookings/calendar`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "โหลดตารางจองไม่สำเร็จ");
  }

  return data;
}
// เช็คเอาท์
export async function checkoutBooking(id, token) {

  const res = await fetch(
    `${API_URL}/bookings/${id}/checkout`,
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
    throw new Error(data.error || "Checkout failed");
  }

  return data;
}
export async function getBookingHistory(
  token,
  page = 1,
  limit = 10,
  search = ''
) {

  const res = await fetch(
    `${API_URL}/bookings/history?page=${page}&limit=${limit}&search=${search}`,
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

export async function getDashboardStats(token) {
  const res = await fetch(`${API_URL}/dashboard/stats`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "โหลดสถิติไม่สำเร็จ");
  }

  return data;
}

export async function getUsers(token) {
  const res = await fetch(`${API_URL}/auth/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "โหลดผู้ใช้ไม่สำเร็จ");
  }

  return data;
}