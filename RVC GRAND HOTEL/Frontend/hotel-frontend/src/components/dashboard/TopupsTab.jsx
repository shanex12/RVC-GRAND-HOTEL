import Swal from "sweetalert2";

export default function TopupsTab({
  topups,
  token,
  loadTopups,
  loadUsers,
}) {
  return (
    <div className="tab-content">

      <div className="topup-header">
        <h2>รายการเติมเครดิต</h2>
      </div>

      <div className="topup-grid">

        {topups.map((item) => (

          <div
            key={item.id}
            className="topup-card"
          >

            <h3>User : {item.username}</h3>

            <p>฿{item.amount}</p>

            <p>
              สถานะ:
              {item.status}
            </p>

            <img
              src={`http://localhost:3000/uploads/${item.slip_image}`}
              alt="slip"
              className="slip-image"
            />

            {item.status !== "approved" && (

              <div className="action-buttons">

                <button
                  className="approve-btn"
                  onClick={async () => {

                    await fetch(
                      `http://localhost:3000/api/topups/${item.id}/approve`,
                      {
                        method: "PUT",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    loadTopups();
                    loadUsers();

                    Swal.fire({
                      title: "สำเร็จ",
                      text: "อนุมัติการเติมเครดิตแล้ว",
                      icon: "success",
                    });

                  }}
                >
                  ✅ อนุมัติ
                </button>

                <button
                  className="delete-btn"
                  onClick={async () => {

                    const result = await Swal.fire({
                      title: "ยืนยันการลบ?",
                      text: "สลิปนี้จะถูกลบถาวร",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonText: "ลบ",
                      cancelButtonText: "ยกเลิก",
                      confirmButtonColor: "#ef4444",
                      cancelButtonColor: "#6b7280",
                    });

                    if (!result.isConfirmed) return;

                    try {

                      await fetch(
                        `http://localhost:3000/api/topups/${item.id}`,
                        {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      Swal.fire({
                        title: "สำเร็จ",
                        text: "ลบสลิปเรียบร้อย",
                        icon: "success",
                      });

                      loadTopups();

                    } catch (err) {

                      Swal.fire({
                        title: "ผิดพลาด",
                        text: "ลบสลิปไม่สำเร็จ",
                        icon: "error",
                      });

                    }

                  }}
                >
                  🗑 ลบ
                </button>

              </div>

            )}

          </div>

        ))}

      </div>

    </div>
  );
}