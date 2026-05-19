import { useEffect, useState } from "react";
import { toast } from "react-toastify";


export default function MyBookings() {

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch("http://localhost:3000/api/my-bookings", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setBookings(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

  }, []);

  const getStatusColor = (status) => {

    switch(status) {

      case "booked":
        return "#f59e0b";

      case "checked_in":
        return "#10b981";

      case "checked_out":
        return "#6b7280";

      default:
        return "#3b82f6";
    }
  };

  const getStatusText = (status) => {

    switch(status) {

      case "booked":
        return "จองแล้ว";

      case "checked_in":
        return "เข้าพักแล้ว";

      case "checked_out":
        return "เช็คเอาท์แล้ว";

      default:
        return status;
    }
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📖 ประวัติการจอง</h1>
          <p style={styles.subtitle}>
            รายการจองห้องพักทั้งหมดของคุณ
          </p>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (

        <div style={styles.loading}>
          กำลังโหลด...
        </div>

      ) : bookings.length === 0 ? (

        <div style={styles.emptyBox}>
          <h2>😢 ยังไม่มีรายการจอง</h2>
          <p>เริ่มจองห้องพักแรกของคุณได้เลย</p>
        </div>

      ) : (

        <div style={styles.grid}>

          {bookings.map((booking) => (

            <div key={booking.id} style={styles.card}
            onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            }}

            onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            }}>

              {/* TOP */}
              <div style={styles.cardTop}>

                <div>
                  <h2 style={styles.roomName}>
                    🏨 {booking.room_name}
                  </h2>

                  <p style={styles.roomType}>
                    {booking.room_type}
                  </p>
                </div>

                <div
                  style={{
                    ...styles.status,
                    backgroundColor: getStatusColor(booking.status)
                  }}
                >
                  {getStatusText(booking.status)}
                </div>

              </div>

              {/* BODY */}
              <div style={styles.body}>

                <div style={styles.infoRow}>
                <span style={styles.infoLabel}>
                    👤 ผู้เข้าพัก
                </span>

                <span style={styles.infoValue}>
                    {booking.guest_name}
                </span>
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>
                    📞 เบอร์โทร
                  </span>
                  <span style={styles.infoValue}>
                    {booking.guest_phone}
                  </span>
                </div>

                <div style={styles.infoRow}>
                        📅 Check-in:
                        {" "}
                        <strong style={styles.infoValue}>
                        {new Date(booking.check_in).toLocaleDateString("th-TH")}
                        
                        {" "}
                        {booking.status === "booked" && (
                            <span style={{
                            color: "#f59e0b",
                            fontWeight: "800",
                            marginLeft: "100px"
                            }}>
                            (เช็คอินได้ตั้งแต่ 12:00 เป็นต้นไป)
                            </span>
                        )}
                        </strong>
                </div>

                <div style={styles.infoRow}>
                        📅 Check-out:
                        {" "}
                        <strong style={styles.infoValue}>
                        {new Date(booking.check_out).toLocaleDateString("th-TH")}
                        
                        {" "}
                        {(booking.status === "checked_in" ||
                            booking.status === "checked_out") && (
                            <span style={{
                            color: "#ef4444",
                            fontWeight: "800",
                            marginLeft: "190px"
                            }}>
                            (เช็คเอาท์ก่อน 12:00)
                            </span>
                        )}
                        </strong>
                </div>

                <div style={styles.priceBox}>
                  💰 {booking.total_price} บาท
                </div>
                    {
                        booking.status === "booked" && (
                        

                        <button
                        style={styles.cancelBtn}
                        onClick={async () => {

                            const confirmCancel = window.confirm(
                            "ต้องการยกเลิกการจองใช่ไหม?"
                            );

                            if (!confirmCancel) return;

                            try {

                            const res = await fetch(
                                `http://localhost:3000/api/bookings/${booking.id}/cancel`,
                                {
                                method: "PUT",
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`
                                }
                                }
                            );

                            const data = await res.json();

                            if (!res.ok) {
                                toast.error(data.error);
                                return;
                            }

                            toast.success("ยกเลิกการจองสำเร็จ");

                            window.location.reload();

                            } catch (err) {

                            console.error(err);

                            }

                        }}
                        >
                        ❌ ยกเลิกการจอง
                        </button>

                    )
                    }
              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

const styles = {

  page: {
    padding: "40px",
    background: "linear-gradient(180deg,#f8fafc,#eef2ff)",
    minHeight: "100vh",
  },

  header: {
    marginBottom: "35px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    fontSize: "38px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-1px",
  },

  subtitle: {
    marginTop: "10px",
    color: "#64748b",
    fontSize: "16px",
    fontWeight: "500",
  },

  loading: {
    background: "#fff",
    padding: "60px",
    borderRadius: "28px",
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "700",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
  },

  emptyBox: {
    background: "#fff",
    borderRadius: "30px",
    padding: "90px 20px",
    textAlign: "center",
    boxShadow: "0 15px 50px rgba(0,0,0,0.08)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(420px,1fr))",
    gap: "30px",
  },

  card: {
    background: "#fff",
    borderRadius: "30px",
    overflow: "hidden",
    boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
    transition: "all 0.3s ease",
    border: "1px solid rgba(226,232,240,0.8)",
  },

  cardTop: {
    background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
    padding: "30px",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  roomName: {
    margin: 0,
    fontSize: "26px",
    fontWeight: "800",
    lineHeight: 1.2,
  },

  roomType: {
    marginTop: "10px",
    opacity: 0.9,
    fontSize: "15px",
    fontWeight: "500",
  },

  status: {
    padding: "12px 18px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#fff",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  },

  body: {
    padding: "28px",
  },

  infoRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingBottom: "18px",
    marginBottom: "18px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "15px",
    color: "#334155",
    lineHeight: 1.7,
  },

  infoLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  infoValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
  },

  priceBox: {
    marginTop: "24px",
    background: "linear-gradient(135deg,#dbeafe,#eff6ff)",
    color: "#1d4ed8",
    padding: "20px",
    borderRadius: "18px",
    fontSize: "26px",
    fontWeight: "800",
    textAlign: "center",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
  },

  cancelBtn: {
    width: "100%",
    marginTop: "22px",
    padding: "16px",
    border: "none",
    borderRadius: "18px",
    background: "linear-gradient(135deg,#ef4444,#dc2626)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.25s ease",
    boxShadow: "0 12px 30px rgba(239,68,68,0.25)",
  },

};