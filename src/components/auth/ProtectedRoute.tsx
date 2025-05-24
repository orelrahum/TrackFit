import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate 
        to="/auth/login" 
        replace={true}
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
};
