import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../helper/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Don't redirect during the initial auth check — show nothing or a spinner
    return null; // later <Spinner /> from react-bootstrap
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;