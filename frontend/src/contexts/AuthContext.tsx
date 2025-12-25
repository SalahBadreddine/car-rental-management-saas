"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getAccessToken, getUser, getUserRole, setUserRole as saveUserRole } from "@/lib/auth"

interface User {
  id: string
  email: string
  name: string
  role: "client" | "enduser"
  company?: string
}

interface AuthContextType {
  user: User | null
  userRole: "client" | "enduser" | null
  selectedLocation: string | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setUserRole: (role: "client" | "enduser") => void
  setSelectedLocation: (location: string) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRoleState] = useState<"client" | "enduser" | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize from localStorage on mount
  useEffect(() => {
    const token = getAccessToken()
    const storedUser = getUser()
    const storedRole = getUserRole()

    if (token && storedUser) {
      setUser(storedUser)
      setUserRoleState((storedRole as "client" | "enduser") || "enduser")
    }
    setIsLoading(false)
  }, [])

  const setUserRole = (role: "client" | "enduser") => {
    setUserRoleState(role)
    saveUserRole(role)
  }

  const clearAuth = () => {
    setUser(null)
    setUserRoleState(null)
    setSelectedLocation(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        selectedLocation,
        isLoading,
        setUser,
        setUserRole,
        setSelectedLocation,
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
