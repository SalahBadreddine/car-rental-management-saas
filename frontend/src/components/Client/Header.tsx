"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import logo from "@/assets/logo.png"
import { logout } from "@/lib/auth"
import { useAuth } from "@/contexts/AuthContext"
import { Bell, MapPin, ChevronDown, Loader2 } from "lucide-react"
import { locationsApi, type Location } from "@/services/locationsApi"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { clearAuth, selectedLocation, setSelectedLocation, tenantId } = useAuth()
  
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      if (!tenantId) return
      
      setIsLoadingLocations(true)
      try {
        const data = await locationsApi.getAll()
        setLocations(data)
        
        // Check localStorage for saved selection
        const savedLocation = localStorage.getItem("selectedLocation")
        
        if (savedLocation === "ALL" && data.length > 1) {
          // "All Locations" was selected
          setCurrentLocation(null)
          setSelectedLocation("")
        } else if (savedLocation && data.length > 0) {
          // Specific location was selected
          const found = data.find(loc => loc.id === savedLocation)
          if (found) {
            setCurrentLocation(found)
            setSelectedLocation(found.id)
          } else {
            // Saved location not found, auto-select first
            setCurrentLocation(data[0])
            setSelectedLocation(data[0].id)
            localStorage.setItem("selectedLocation", data[0].id)
          }
        } else if (data.length > 0 && !savedLocation) {
          // No selection yet, auto-select first location
          setCurrentLocation(data[0])
          setSelectedLocation(data[0].id)
          localStorage.setItem("selectedLocation", data[0].id)
        }
      } catch (error) {
        console.error('Error fetching locations:', error)
      } finally {
        setIsLoadingLocations(false)
      }
    }

    fetchLocations()
  }, [tenantId])

  // Update current location when selectedLocation changes
  useEffect(() => {
    if (selectedLocation && locations.length > 0) {
      const found = locations.find(loc => loc.id === selectedLocation)
      if (found) setCurrentLocation(found)
    }
  }, [selectedLocation, locations])

  const isActive = (path: string) => {
    if (path === "/client/home" && (location.pathname === "/" || location.pathname === "/client/home")) {
      return true
    }
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const handleLogout = () => {
    logout()
    clearAuth()
    navigate("/browse", { replace: true })
  }

  const handleLocationChange = (locationId: string | null) => {
    if (locationId === null) {
      // "All" locations selected
      setCurrentLocation(null)
      setSelectedLocation("")
      localStorage.setItem("selectedLocation", "ALL") // Save as special value
    } else {
      const loc = locations.find(l => l.id === locationId)
      if (loc) {
        setCurrentLocation(loc)
        setSelectedLocation(loc.id)
        localStorage.setItem("selectedLocation", loc.id)
      }
    }
  }

  const hideNav = ["/signin", "/signup"].includes(location.pathname)

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/client/home"
              className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
            >
              <img src={logo || "/placeholder.svg"} alt="Logo" className="h-8" />
              <span className="font-heading font-bold text-xl">RentoGo</span>
            </Link>
            
            {/* Location Selector Dropdown */}
            {!hideNav && tenantId && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-sm px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                  {isLoadingLocations ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {currentLocation ? currentLocation.name : (selectedLocation === "" && locations.length > 1 ? "All Locations" : "Select Location")}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {locations.length === 0 ? (
                    <DropdownMenuItem disabled>
                      No locations found
                    </DropdownMenuItem>
                  ) : (
                    <>
                      {/* Show "All Locations" option only if there are multiple locations */}
                      {locations.length > 1 && (
                        <DropdownMenuItem
                          onClick={() => handleLocationChange(null)}
                          className={`cursor-pointer ${!currentLocation && selectedLocation === "" ? 'bg-primary/10' : ''}`}
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          <div>
                            <p className="font-medium">All Locations</p>
                            <p className="text-xs text-muted-foreground">View all</p>
                          </div>
                        </DropdownMenuItem>
                      )}
                      
                      {locations.map((loc) => (
                        <DropdownMenuItem
                          key={loc.id}
                          onClick={() => handleLocationChange(loc.id)}
                          className={`cursor-pointer ${currentLocation?.id === loc.id ? 'bg-primary/10' : ''}`}
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          <div>
                            <p className="font-medium">{loc.name}</p>
                            <p className="text-xs text-muted-foreground">{loc.city}</p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {!hideNav && (
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/client/home"
                className={`font-medium transition-colors ${
                  isActive("/client/home") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Home
              </Link>

              <Link
                to="/client/vehicles"
                className={`font-medium transition-colors ${
                  isActive("/client/vehicles") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Vehicles
              </Link>

              <Link
                to="/client/dashboard"
                className={`font-medium transition-colors ${
                  isActive("/client/dashboard") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/client/reservations"
                className={`font-medium transition-colors ${
                  isActive("/client/reservations") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Reservations
              </Link>

              <Link
                to="/client/add-vehicle"
                className={`font-medium transition-colors ${
                  isActive("/client/add-vehicle") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Add Vehicle
              </Link>

              <Link to="/client/notifications" className="relative hover:opacity-70 transition-opacity">
                <Bell className="w-6 h-6" />
              </Link>

              <button onClick={handleLogout} className="font-medium text-red-500 hover:text-red-600 transition-colors">
                Logout
              </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
