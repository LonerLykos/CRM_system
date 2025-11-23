import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {type JSX, Suspense} from "react";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
      <Suspense fallback={<div>Loading...</div>}>
          {children}
      </Suspense>
  )
};
