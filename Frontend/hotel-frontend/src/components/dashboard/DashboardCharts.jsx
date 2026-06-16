import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
];

export default function DashboardCharts({
  revenueData,
  bookingStatusData,
  roomData,
}) {
  return (
    <div style={styles.chartGrid}>

      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>
          📈 รายได้รายเดือน
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#4f46e5"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>
          🏨 สถานะการจอง
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={bookingStatusData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {bookingStatusData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>
          🛏️ ประเภทห้องยอดนิยม
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={roomData}>
            <XAxis dataKey="room" />
            <YAxis />
            <Tooltip />

            <Bar
              dataKey="count"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

const styles = {
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(350px,1fr))",
    gap: "20px",
    marginBottom: "40px",
  },

  chartCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  chartTitle: {
    marginBottom: "16px",
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },
};