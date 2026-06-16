import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyTopups } from "../api/topup";
import "../styles/topup-history.css";
import { useNavigate } from "react-router-dom";


export default function TopupHistory() {
    
  const navigate = useNavigate();

  const { token } = useAuth();

  const [topups, setTopups] = useState([]);

  useEffect(() => {
    loadTopups();
  }, []);

  const loadTopups = async () => {
    try {
      const data = await getMyTopups(token);
      setTopups(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
  <div className="history-page">

    <div className="history-header">
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        ← กลับ
      </button>

      <h1>ประวัติการเติมเครดิต</h1>
    </div>

    <div className="summary-grid">

      <div className="summary-card">
        <h2>{topups.length}</h2>
        <p>รายการทั้งหมด</p>
      </div>

      <div className="summary-card">
        <h2>
          ฿{
            topups
              .filter(t => t.status === "approved")
              .reduce((sum,t) => sum + Number(t.amount),0)
          }
        </h2>
        <p>เครดิตที่ได้รับ</p>
      </div>

      <div className="summary-card">
        <h2>
          {
            topups.filter(
              t => t.status === "pending"
            ).length
          }
        </h2>
        <p>รอตรวจสอบ</p>
      </div>

    </div>
    

    {topups.length === 0 ? (
      <div className="empty-history">
        <div className="empty-icon">💳</div>
        <h3>ยังไม่มีประวัติการเติมเครดิต</h3>
        <p>เมื่อคุณเติมเครดิต รายการจะปรากฏที่นี่</p>
      </div>
    ) : (
      <div className="history-list">

        {topups.map((item) => (
          <div
            className="history-card"
            key={item.id}
          >

            <div>
              <div className="history-left">

                <div className="history-icon">
                    💳
                </div>

                <div>
                    <h3>เติมเครดิต ฿{item.amount}</h3>

                    <p>รายการ #{item.id}</p>

                    <p>
                    {new Date(item.created_at)
                        .toLocaleString("th-TH")}
                    </p>
                </div>

                </div>
            </div>

            <span className={`status-badge ${item.status}`}>

            {item.status === "approved" && "✅ อนุมัติแล้ว"}

            {item.status === "pending" && "⏳ รอตรวจสอบ"}

            {item.status === "rejected" && "❌ ปฏิเสธ"}

            </span>

          </div>
        ))}

      </div>
    )}

  </div>
);
}