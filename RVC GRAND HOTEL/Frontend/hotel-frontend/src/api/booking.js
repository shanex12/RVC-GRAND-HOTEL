
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

export const createBooking = async (data) => {
  const formData = new FormData();

  formData.append("guest_name", data.guest_name);
  formData.append("room_id", data.room_id);
  formData.append("check_in", data.check_in);
  formData.append("check_out", data.check_out);
  formData.append("payment_method", data.payment_method);

  if (data.slip) {
    formData.append("slip", data.slip);
  }

  const res = await fetch(`${API}/bookings`, {
    method: "POST",
    body: formData,
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "จองไม่สำเร็จ");
  }

  return result;
};
