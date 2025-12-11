import { Navigate } from "react-router-dom";
import { getAccessToken } from "@/lib/auth";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = getAccessToken();
  if (!token) return <Navigate to="/signin" replace />;
  return children;
};

export default ProtectedRoute;