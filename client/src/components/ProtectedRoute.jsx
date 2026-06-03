import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../helper/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

    // later spinner or something while checking auth status

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;