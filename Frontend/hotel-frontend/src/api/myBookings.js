export async function getMyBookings(token) {

  const res = await fetch(
    "http://localhost:3000/api/my-bookings",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "โหลดข้อมูลไม่สำเร็จ");
  }

  return data;
}