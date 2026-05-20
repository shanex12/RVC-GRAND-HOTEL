export default function StatCard({ title, value, icon = "📊", color = "#667eea" }) {
  return (
    <div style={{
      ...styles.card,
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={styles.header}>
        <span style={{ fontSize: "28px" }}>{icon}</span>
        <h4 style={styles.title}>{title}</h4>
      </div>
      <h2 style={{...styles.value, color: color}}>{value}</h2>
    </div>
  );
}


const styles = {
  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px",
  },
  title: {
    color: "#6b7280",
    fontSize: "15px",
    fontWeight: "500",
    margin: 0,
  },
  value: {
    fontSize: "36px",
    fontWeight: "700",
    margin: 0,
  },
};
