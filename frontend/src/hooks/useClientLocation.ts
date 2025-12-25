"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { CLIENT_LOCATIONS } from "@/lib/locations"

/**
 * Hook to manage client location selection
 * Ensures clients have selected a location before accessing dashboard
 */
export const useClientLocation = () => {
  const navigate = useNavigate()
  const { selectedLocation, userRole } = useAuth()

  useEffect(() => {
    // If client is not on location select page and hasn't selected a location, redirect
    if (userRole === "client" && !selectedLocation && !window.location.pathname.includes("location-select")) {
      navigate("/client/location-select", { replace: true })
    }
  }, [selectedLocation, userRole, navigate])

  const getLocationDetails = (locationId: string | null) => {
    if (!locationId) return null
    return CLIENT_LOCATIONS.find((loc) => loc.id === locationId)
  }

  const currentLocation = getLocationDetails(selectedLocation)

  return {
    selectedLocation,
    currentLocation,
    allLocations: CLIENT_LOCATIONS,
    getLocationDetails,
  }
}
