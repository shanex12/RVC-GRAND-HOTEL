import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  console.log("loading =", loading);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏨 RVC Hotel</h1>
          <p style={styles.subtitle}>เข้าสู่ระบบ</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorBox}>
              <p>❌ {error}</p>
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>👤 ชื่อผู้ใช้</label>
            <input
              type="text"
              style={styles.input}
              placeholder="กรุณากรอกชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>🔐 รหัสผ่าน</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                style={{
                  ...styles.input,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'text'
                  
                }}
                placeholder="กรุณากรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                style={styles.toggleButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#1d4ed8')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
          >
            {loading ? '⏳ กำลังเข้าสู่ระบบ...' : '✓ เข้าสู่ระบบ'}
          </button>
        </form>

        <div style={styles.divider}></div>

        <p style={styles.switchText}>
          ยังไม่มีบัญชี?{' '}
          <button
            style={styles.linkButton}
            onClick={() => navigate('/register')}
            disabled={loading}
          >
            สมัครสมาชิก
          </button>
        </p>

        <div style={styles.testBox}>
          <p><strong>🧪 ทดสอบ:</strong></p>
          <p>Admin: admin / password</p>
          <p>User: user / password</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7fa',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid #e5e7eb',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#667eea',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    margin: 0,
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '12px 14px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    backgroundColor: '#fafafa',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  toggleButton: {
    position: 'absolute',
    right: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '14px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '10px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '30px 0',
  },
  switchText: {
    textAlign: 'center',
    color: '#666',
    fontSize: '14px',
    margin: '0 0 20px 0',
  },
  linkButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'underline',
    fontSize: '14px',
  },
  testBox: {
    backgroundColor: '#f0f4ff',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '13px',
    borderLeft: '4px solid #667eea',
    color: '#333',
  },
};
