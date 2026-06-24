const API_URL = "/api";

function authHeaders() {

  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
export async function getRooms() {
  const res = await fetch(`${API_URL}/rooms`);
  return res.json();
}

export async function getBookings() {

  const res = await fetch(
    `${API_URL}/bookings`,
    {
      headers: authHeaders(),
    }
  );

  return res.json();
}
