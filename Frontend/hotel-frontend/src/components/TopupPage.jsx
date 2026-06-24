import { useState } from "react";
import Swal from 'sweetalert2';

export default function TopupPage() {

  const [amount, setAmount] = useState("");
  const [slip, setSlip] = useState(null);
  const [slipPreview, setSlipPreview] = useState("");

  const handleTopup = async () => {

    if (!amount || !slip) {
      Swal.fire({
        title: 'ผิดพลาด',
        text: 'กรุณาระบุจำนวนเครดิตที่ต้องการเติมและอัปโหลดสลิป',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("amount", amount);
    formData.append("slip", slip);

    const res = await fetch(
      "/api/topups",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      Swal.fire({
        title: 'ผิดพลาด',
        text: data.error || 'กรุณาระบุจำนวนเครดิตที่ต้องการเติม',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    Swal.fire({
      title: 'สำเร็จ',
      text: 'ส่งคำขอเติมเครดิตแล้ว',
      icon: 'success',
      confirmButtonColor: '#22c55e',
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h1>เติมเครดิต</h1>

        <img
          src="/payment/promptpay-real.jpg"
          alt="qr"
          style={styles.qr}
        />

        <input
          type="number"
          placeholder="จำนวนเงิน"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
        />

        <input
        type="file"
        accept="image/*"
        onChange={(e) => {
            const file = e.target.files[0];

            if (file) {
            setSlip(file);
            setSlipPreview(URL.createObjectURL(file));
            }
        }}
        />

        {slipPreview && (
        <img
            src={slipPreview}
            alt="Slip Preview"
            style={{
            width: "220px",
            marginTop: "12px",
            borderRadius: "12px",
            border: "1px solid #ccc",
            objectFit: "cover",
            }}
        />
        )}


        <button
          style={styles.button}
          onClick={handleTopup}
        >
          ยืนยันการเติมเครดิต
        </button>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6",
  },

  card: {
    width: "400px",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    alignItems: "center",
  },

  qr: {
    width: "250px",
    borderRadius: "12px",
  },

  input: {
    width: "100%",
    padding: "12px",
  },

  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
  },
};