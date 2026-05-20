import { useEffect, useState } from "react";

export default function UserManagement() {

  const [users, setUsers] = useState([]);
  const [showCreditModal, setShowCreditModal] =
  useState(false);

const [selectedUser, setSelectedUser] =
  useState(null);

const [creditAmount, setCreditAmount] =
  useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:3000/api/auth/users",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      setUsers(data);

    } catch (err) {
      console.error(err);
    }
  };

  const changeRole = async (id, role) => {

  try {

    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:3000/api/auth/users/${id}/role`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          role
        })
      }
    );

    fetchUsers();

  } catch (err) {

    console.error(err);

  }
};

const updateRole = async (id, role) => {

  try {

    console.log("ROLE =", role);

    const token =
      localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:3000/api/auth/users/${id}/role`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          role: role
        })
      }
    );

    const data = await res.json();

    console.log(data);

    fetchUsers();

  } catch (err) {

    console.error(err);

  }
};

const deleteUser = async (id) => {

  const confirmDelete =
    window.confirm("ลบผู้ใช้นี้หรือไม่");

  if (!confirmDelete) return;

  try {

    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:3000/api/auth/users/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    fetchUsers();

  } catch (err) {

    console.error(err);

  }
};
const openCreditModal = (user) => {

  setSelectedUser(user);

  setCreditAmount("");

  setShowCreditModal(true);

};

const submitCredit = async () => {

  try {

    const token =
      localStorage.getItem("token");

    await fetch(
      `http://localhost:3000/api/auth/users/${selectedUser.id}/credit`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          credit: Number(creditAmount)
        })
      }
    );

    setShowCreditModal(false);

    fetchUsers();

  } catch (err) {

    console.error(err);

  }

};

  const getRoleColor = (role) => {

    switch(role) {

      case "admin":
        return {
          bg: "#fee2e2",
          text: "#dc2626"
        };

      case "staff":
        return {
          bg: "#dbeafe",
          text: "#2563eb"
        };

      default:
        return {
          bg: "#dcfce7",
          text: "#16a34a"
        };
    }
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.headerCard}>

        <div>
          <h1 style={styles.title}>
            👥 จัดการผู้ใช้
          </h1>

          <p style={styles.subtitle}>
            จัดการ role เครดิต และข้อมูลผู้ใช้ทั้งหมด
          </p>
        </div>

        <div style={styles.statsCard}>
          <div style={styles.statsNumber}>
            {users.length}
          </div>

          <div style={styles.statsLabel}>
            USERS
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div style={styles.tableCard}>

        <table style={styles.table}>

          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>USERNAME</th>
              <th style={styles.th}>EMAIL</th>
              <th style={styles.th}>CREDIT</th>
              <th style={styles.th}>ACTION</th>
            </tr>
          </thead>

          <tbody>

            {users.map((u) => {

              const roleStyle =
                getRoleColor(u.role);

              return (

                <tr
                  key={u.id}
                  style={styles.tr}
                >

                  <td style={styles.td}>
                    #{u.id}
                  </td>

                  <td style={styles.td}>
                    {u.username}
                  </td>

                  <td style={styles.td}>
                    {u.email}
                  </td>

                  <td style={styles.td}>
                    ฿ {Number(u.credit || 0).toLocaleString()}
                  </td>

                  <td style={styles.td}>

                    <div style={styles.actionGroup}>

                        <select
                        value={u.role}
                        onChange={(e) =>
                            updateRole(u.id, e.target.value)
                        }
                        style={styles.selectRole}
                        >
                        <option value="admin">
                            admin
                        </option>

                        <option value="staff">
                            staff
                        </option>

                        <option value="user">
                            user
                        </option>
                        </select>


                        <button
                        style={styles.creditBtn}
                        onClick={() => openCreditModal(u)}
                        >
                        + เครดิต
                        </button>

                        <button
                        style={styles.deleteBtn}
                        onClick={() =>
                            deleteUser(u.id)
                        }
                        >
                        Delete
                        </button>

                    </div>

                    </td>

                </tr>

              );
            })}

          </tbody>

        </table>

      </div>
{showCreditModal && (

  <div style={styles.modalOverlay}>

    <div style={styles.modal}>

      <h2 style={styles.modalTitle}>
        เติมเครดิต
      </h2>

      <p style={styles.modalUser}>
        {selectedUser?.username}
      </p>

      <input
        type="number"
        placeholder="จำนวนเครดิต"
        value={creditAmount}
        onChange={(e) =>
          setCreditAmount(
            e.target.value
          )
        }
        style={styles.input}
      />

      <div style={styles.modalButtons}>

        <button
          style={styles.cancelBtn}
          onClick={() =>
            setShowCreditModal(false)
          }
        >
          ยกเลิก
        </button>

        <button
          style={styles.saveBtn}
          onClick={submitCredit}
        >
          เติมเครดิต
        </button>

      </div>

    </div>

  </div>

)}
    </div>
  );
}

const styles = {

  page: {
    padding: "35px",
    background: "#f4f7fb",
    minHeight: "100vh",
    fontFamily: "'Poppins', sans-serif"
  },

  headerCard: {
    background:
      "linear-gradient(135deg,#0f172a,#1e293b)",
    borderRadius: "24px",
    padding: "30px",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    boxShadow:
      "0 15px 40px rgba(0,0,0,0.18)"
  },

  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "800"
  },

  subtitle: {
    marginTop: "10px",
    color:
      "rgba(255,255,255,0.75)"
  },

  statsCard: {
    textAlign: "center",
    background:
      "rgba(255,255,255,0.08)",
    padding: "18px 28px",
    borderRadius: "18px",
    backdropFilter: "blur(10px)"
  },

  statsNumber: {
    fontSize: "36px",
    fontWeight: "800"
  },

  statsLabel: {
    fontSize: "12px",
    letterSpacing: "3px",
    opacity: 0.8
  },

  tableCard: {
    background: "#fff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow:
      "0 12px 35px rgba(0,0,0,0.08)"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  th: {
    background: "#f8fafc",
    padding: "18px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "700",
    color: "#475569",
    borderBottom:
      "1px solid #e2e8f0"
  },

  tr: {
    transition: "0.2s"
  },

  td: {
    padding: "18px",
    borderBottom:
      "1px solid #f1f5f9",
    fontSize: "14px",
    color: "#1e293b"
  },

  roleBadge: {
    padding: "8px 14px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "12px",
    textTransform: "uppercase"
  },

  actionGroup: {
    display: "flex",
    gap: "10px"
  },

  editBtn: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg,#3b82f6,#2563eb)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600"
  },

  deleteBtn: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg,#ef4444,#dc2626)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600"
  },
  select: {
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontWeight: "600",
  outline: "none"
 },
    creditBtn: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    background:
        "linear-gradient(135deg,#10b981,#059669)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600"
 },
 modalOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999
},

modal: {
  background: "#fff",
  borderRadius: "20px",
  padding: "30px",
  width: "400px",
  boxShadow:
    "0 15px 40px rgba(0,0,0,0.2)"
},

modalTitle: {
  margin: 0,
  fontSize: "28px",
  fontWeight: "800",
  marginBottom: "10px"
},

modalUser: {
  color: "#64748b",
  marginBottom: "20px"
},

input: {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "16px",
  marginBottom: "20px",
  outline: "none"
},

modalButtons: {
  display: "flex",
  gap: "10px",
  justifyContent: "flex-end"
},

cancelBtn: {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#e2e8f0",
  cursor: "pointer",
  fontWeight: "600"
},

saveBtn: {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "none",
  background:
    "linear-gradient(135deg,#10b981,#059669)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "700"
},
selectRole: {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontWeight: "600",
  cursor: "pointer",
  background: "#fff"
},
};