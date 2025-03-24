import React from 'react'
import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const ProtectedRoute = () => {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return <Navigate to="/signup" replace />;
  }

  return children;
}

export default ProtectedRoute
