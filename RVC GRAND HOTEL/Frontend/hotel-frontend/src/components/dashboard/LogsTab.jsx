export default function LogsTab({ logs }) {
  return (
    <div className="tab-content">

      <h2 className="section-title">
        📜 ประวัติการทำรายการทั้งหมด
      </h2>

      {logs.length === 0 ? (

        <div className="empty-state">
          ไม่มี activity logs
        </div>

      ) : (

        <div className="logs-container">

          {logs.map((log) => (

            <div key={log.id} className="log-card">

              <div className="log-message">

                <span className="log-admin-name">
                  {log.admin_name}
                </span>

                {" — "}

                {log.action}

              </div>

              <div className="log-time">
                {new Date(log.created_at).toLocaleString("th-TH")}
              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}