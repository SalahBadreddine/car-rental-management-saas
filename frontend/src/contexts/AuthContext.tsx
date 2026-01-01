"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getAccessToken, getUser, getUserRole, setUserRole as saveUserRole } from "@/lib/auth"
import { apiRequest } from "@/lib/api"

interface User {
  id: string
  email: string
  name?: string
  full_name?: string
  avatar_url?: string
  role: "client" | "enduser" | "client_admin" | "customer" | "super_admin"
  tenant_id?: string
  company?: string
  phone_number?: string
}

interface AuthContextType {
  user: User | null
  userRole: "client" | "enduser" | "super_admin" | null
  tenantId: string | null
  selectedLocation: string | null
  isLoading: boolean
  isTenantDataLoading: boolean
  isAdmin: boolean
  tenantData: any | null
  websiteConfig: Record<string, any>
  setUser: (user: User | null) => void
  setUserRole: (role: "client" | "enduser" | "super_admin") => void
  setSelectedLocation: (location: string) => void
  updateWebsiteConfig: (config: Record<string, any>) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Map backend role to frontend role
 * Backend uses: client_admin, customer
 * Frontend uses: client, enduser
 */
const mapBackendRole = (backendRole: string): "client" | "enduser" | "super_admin" => {
  if (backendRole === "super_admin") {
    return "super_admin"
  }
  if (backendRole === "client_admin" || backendRole === "client") {
    return "client"
  }
  return "enduser"
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null)
  const [userRole, setUserRoleState] = useState<"client" | "enduser" | "super_admin" | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTenantDataLoading, setIsTenantDataLoading] = useState(false)
  const [tenantData, setTenantData] = useState<any | null>(null)
  const [websiteConfig, setWebsiteConfig] = useState<Record<string, any>>({})


  useEffect(() => {
    const token = getAccessToken()
    const storedUser = getUser()
    const storedRole = getUserRole()
    const storedLocation = localStorage.getItem("selectedLocation")

    if (token && storedUser) {
      console.log('AuthContext Init via localStorage:', { storedUser, storedRole })
      setUserState(storedUser)
      

      const mappedRole = storedUser.role 
        ? mapBackendRole(storedUser.role) 
        : (storedRole as "client" | "enduser" | "super_admin") || "enduser"
      
      setUserRoleState(mappedRole)
      setTenantId(storedUser.tenant_id || null)
    }
    
    if (storedLocation) {
      setSelectedLocation(storedLocation)
    }
    
    setIsLoading(false)
  }, [])


  const isAdmin = userRole === "client" || user?.role === "client_admin"


  useEffect(() => {
    const fetchTenantData = async () => {
      if (tenantId && isAdmin) {
        setIsTenantDataLoading(true)
        try {
          const response = await apiRequest(`/tenants/${tenantId}`, 'GET')
          if (response.status === 200 && response.data) {
            setTenantData(response.data)
            setWebsiteConfig(response.data.website_config || {})
          }
        } catch (error) {
          console.error('Failed to fetch tenant data:', error)
        } finally {
          setIsTenantDataLoading(false)
        }
      }
    }
    
    fetchTenantData()
  }, [tenantId, isAdmin])

  const setUser = (newUser: User | null) => {
    setUserState(newUser)
    if (newUser) {
      setTenantId(newUser.tenant_id || null)

      if (newUser.role) {
        const mappedRole = mapBackendRole(newUser.role)
        setUserRoleState(mappedRole)
        saveUserRole(mappedRole)
      }
    } else {
      setTenantId(null)
    }
  }

  const setUserRole = (role: "client" | "enduser" | "super_admin") => {
    setUserRoleState(role)
    saveUserRole(role)
  }

  const handleSetSelectedLocation = (location: string) => {
    setSelectedLocation(location)
    if (location === "") {
      localStorage.setItem("selectedLocation", "ALL")
    } else if (location) {
      localStorage.setItem("selectedLocation", location)
    }
  }

  const updateWebsiteConfig = (config: Record<string, any>) => {
    setWebsiteConfig(config)
    if (tenantData) {
      setTenantData({ ...tenantData, website_config: config })
    }
  }

  const clearAuth = () => {
    setUserState(null)
    setUserRoleState(null)
    setTenantId(null)
    setSelectedLocation(null)
    setTenantData(null)
    setWebsiteConfig({})
    localStorage.removeItem("selectedLocation")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        tenantId,
        selectedLocation,
        isLoading,
        isTenantDataLoading,
        isAdmin,
        tenantData,
        websiteConfig,
        setUser,
        setUserRole,
        setSelectedLocation: handleSetSelectedLocation,
        updateWebsiteConfig,
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
