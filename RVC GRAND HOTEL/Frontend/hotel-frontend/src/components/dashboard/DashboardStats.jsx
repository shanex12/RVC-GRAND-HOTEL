import StatCard from "../StatCard";

export default function DashboardStats({ stats }) {
  return (
    <div style={styles.statsGrid}>

      <StatCard
        title="รายได้วันนี้"
        value={`฿${Number(stats.todayRevenue).toLocaleString()}`}
        icon="💰"
        color="#22c55e"
      />

      <StatCard
        title="รายได้เดือนนี้"
        value={`฿${Number(stats.monthRevenue).toLocaleString()}`}
        icon="📅"
        color="#3b82f6"
      />

      <StatCard
        title="ห้องว่าง"
        value={stats.availableRooms}
        icon="🛏️"
        color="#f59e0b"
      />

      <StatCard
        title="ลูกค้าเข้าพัก"
        value={stats.checkedIn}
        icon="👥"
        color="#8b5cf6"
      />

    </div>
  );
}

const styles = {
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
};