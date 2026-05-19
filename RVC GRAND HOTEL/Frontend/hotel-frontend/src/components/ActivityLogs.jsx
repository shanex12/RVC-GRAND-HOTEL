import { useEffect, useState } from "react";

export default function ActivityLogs() {

  const [logs, setLogs] = useState([]);

  useEffect(() => {

    loadLogs();

  }, []);

  const loadLogs = async () => {

    try {

      const res = await fetch(
        "http://localhost:3000/api/bookings/logs"
      );

      const data = await res.json();

      setLogs(data);

    } catch (err) {

      console.error(err);

    }

  };

  if (logs.length === 0) {

    return (
      <p>ไม่มี activity logs</p>
    );

  }

  return (

    <div style={styles.container}>

      {logs.map((log) => (

        <div
          key={log.id}
          style={styles.card}
        >

          <div style={styles.topRow}>

            <span style={styles.admin}>
              👤 {log.admin_name}
            </span>

            <span style={styles.time}>
              {
                new Date(log.created_at)
                .toLocaleString('th-TH')
              }
            </span>

          </div>

            <p>
               <b>{log.admin_name}</b> — {log.action}
            </p>

        </div>

      ))}

    </div>

  );
}

const styles = {

  container: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  card: {
    background: "#fff",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    border: "1px solid #eee",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  admin: {
    fontWeight: "700",
    color: "#111827",
  },

  time: {
    fontSize: "13px",
    color: "#6b7280",
  },

  action: {
    margin: 0,
    fontSize: "15px",
    color: "#374151",
  },

};