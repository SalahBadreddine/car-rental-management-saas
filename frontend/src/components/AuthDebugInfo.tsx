"use client"

import { useAuth } from "@/contexts/AuthContext"

/**
 * Debug component to display current auth state
 * Remove this in production
 */
export const AuthDebugInfo = () => {
  const { user, userRole, selectedLocation, isLoading } = useAuth()

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="mb-2 font-bold">Auth Debug Info</div>
      <div className="space-y-1">
        <div>Loading: {isLoading ? "true" : "false"}</div>
        <div>User: {user ? user.email : "null"}</div>
        <div>Role: {userRole || "null"}</div>
        <div>Location: {selectedLocation || "null"}</div>
      </div>
    </div>
  )
}
