"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

interface ProtectedRouteProps {
  children: JSX.Element
  requiredRole?: "client" | "enduser"
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, userRole, isLoading } = useAuth()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  // Redirect to role selection if not logged in
  if (!user || !userRole) {
    return <Navigate to="/browse" replace />
  }

  // Check role if required
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}

// Keep default export for backward compatibility
export default ProtectedRoute
