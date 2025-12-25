"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getAccessToken, getUser, getUserRole, setUserRole as saveUserRole } from "@/lib/auth"

interface User {
  id: string
  email: string
  name?: string
  full_name?: string
  role: "client" | "enduser" | "client_admin" | "customer"
  tenant_id?: string
  company?: string
}

interface AuthContextType {
  user: User | null
  userRole: "client" | "enduser" | null
  tenantId: string | null
  selectedLocation: string | null
  isLoading: boolean
  isAdmin: boolean
  setUser: (user: User | null) => void
  setUserRole: (role: "client" | "enduser") => void
  setSelectedLocation: (location: string) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Map backend role to frontend role
 * Backend uses: client_admin, customer
 * Frontend uses: client, enduser
 */
const mapBackendRole = (backendRole: string): "client" | "enduser" => {
  if (backendRole === "client_admin" || backendRole === "client") {
    return "client"
  }
  return "enduser"
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null)
  const [userRole, setUserRoleState] = useState<"client" | "enduser" | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize from localStorage on mount
  useEffect(() => {
    const token = getAccessToken()
    const storedUser = getUser()
    const storedRole = getUserRole()
    const storedLocation = localStorage.getItem("selectedLocation")

    if (token && storedUser) {
      setUserState(storedUser)
      
      // Map backend role to frontend role
      const mappedRole = storedUser.role 
        ? mapBackendRole(storedUser.role) 
        : (storedRole as "client" | "enduser") || "enduser"
      
      setUserRoleState(mappedRole)
      setTenantId(storedUser.tenant_id || null)
    }
    
    if (storedLocation) {
      setSelectedLocation(storedLocation)
    }
    
    setIsLoading(false)
  }, [])

  const setUser = (newUser: User | null) => {
    setUserState(newUser)
    if (newUser) {
      setTenantId(newUser.tenant_id || null)
      // Also update role when user changes
      if (newUser.role) {
        const mappedRole = mapBackendRole(newUser.role)
        setUserRoleState(mappedRole)
        saveUserRole(mappedRole)
      }
    } else {
      setTenantId(null)
    }
  }

  const setUserRole = (role: "client" | "enduser") => {
    setUserRoleState(role)
    saveUserRole(role)
  }

  const handleSetSelectedLocation = (location: string) => {
    setSelectedLocation(location)
    // Save to localStorage - empty string means "ALL", so we save as "ALL"
    if (location === "") {
      localStorage.setItem("selectedLocation", "ALL")
    } else if (location) {
      localStorage.setItem("selectedLocation", location)
    }
  }

  const clearAuth = () => {
    setUserState(null)
    setUserRoleState(null)
    setTenantId(null)
    setSelectedLocation(null)
    localStorage.removeItem("selectedLocation")
  }

  // Check if user is admin
  const isAdmin = userRole === "client" || user?.role === "client_admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        tenantId,
        selectedLocation,
        isLoading,
        isAdmin,
        setUser,
        setUserRole,
        setSelectedLocation: handleSetSelectedLocation,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
