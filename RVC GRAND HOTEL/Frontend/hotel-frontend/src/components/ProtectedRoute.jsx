import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ กำลังโหลด...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const {
    isAuthenticated,
    user,
    loading
  } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ กำลังโหลด...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    user?.role !== "admin" &&
    user?.role !== "staff"
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function StaffRoute({ children }) {

  const {
    isAuthenticated,
    user,
    loading
  } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center'
        }}
      >
        ⏳ กำลังโหลด...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    user?.role !== "admin" &&
    user?.role !== "staff"
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ กำลังโหลด...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
