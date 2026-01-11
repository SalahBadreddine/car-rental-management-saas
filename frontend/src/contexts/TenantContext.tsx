"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useParams } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export interface Tenant {
  id: string
  name: string
  slug: string
  logo_url?: string
  contact_email?: string
  phone_number?: string
  website_config?: Record<string, any>
}

export interface Location {
  id: string
  tenant_id: string
  name: string
  city: string
  address?: string
  image_url?: string
}

interface TenantContextValue {
  tenant: Tenant | null
  tenantId: string | null
  tenantSlug: string | null
  locations: Location[]
  selectedLocationId: string | null
  setSelectedLocationId: (id: string | null) => void
  isLoading: boolean
  error: string | null
  refetchTenant: () => Promise<void>
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined)

export function TenantProvider({ children }: { children: ReactNode }) {
  const { tenantSlug } = useParams<{ tenantSlug: string }>()
  
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTenant = async () => {
    if (!tenantSlug) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch tenant by slug (public endpoint)
      const tenantResponse = await fetch(`${API_BASE_URL}/tenants/by-slug/${tenantSlug}`)
      
      if (!tenantResponse.ok) {
        if (tenantResponse.status === 404) {
          setError(`Rental company "${tenantSlug}" not found`)
        } else {
          setError('Failed to load rental company')
        }
        setTenant(null)
        setLocations([])
        setIsLoading(false)
        return
      }

      const tenantData = await tenantResponse.json()
      setTenant(tenantData)

      // Fetch locations for this tenant (public endpoint)
      const locationsResponse = await fetch(`${API_BASE_URL}/locations?tenantId=${tenantData.id}`)
      
      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json()
        setLocations(locationsData || [])
        
        // Auto-select first location if none selected
        if (locationsData?.length > 0 && !selectedLocationId) {
          setSelectedLocationId(locationsData[0].id)
        }
      } else {
        setLocations([])
      }
    } catch (err) {
      console.error('Error fetching tenant:', err)
      setError('Failed to load rental company')
      setTenant(null)
      setLocations([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTenant()
  }, [tenantSlug])

  const value: TenantContextValue = {
    tenant,
    tenantId: tenant?.id || null,
    tenantSlug: tenantSlug || null,
    locations,
    selectedLocationId,
    setSelectedLocationId,
    isLoading,
    error,
    refetchTenant: fetchTenant,
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

/**
 * Optional hook for components that may or may not be inside TenantProvider
 * Returns null if not in tenant context (e.g., on /browse or /signin pages)
 */
export function useTenantOptional() {
  return useContext(TenantContext) ?? null
}

export default TenantContext
