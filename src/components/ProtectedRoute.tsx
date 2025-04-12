
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();

  // If still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If role restriction exists and user doesn't have required role
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/check-in" replace />;
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
