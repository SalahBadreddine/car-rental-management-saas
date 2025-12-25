"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import logo from "@/assets/logo.png"
import { logout } from "@/lib/auth"
import { useAuth } from "@/contexts/AuthContext"
import { Bell } from "lucide-react"

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { clearAuth, selectedLocation } = useAuth()

  const isActive = (path: string) => {
    if (path === "/client/home" && (location.pathname === "/" || location.pathname === "/client/home")) {
      return true
    }
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const handleLogout = () => {
    logout()
    clearAuth()
    navigate("/role-select", { replace: true })
  }

  const hideNav = ["/signin", "/signup", "/role-select"].includes(location.pathname)

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
            {selectedLocation && (
              <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-full">
                📍 {selectedLocation.charAt(0).toUpperCase() + selectedLocation.slice(1)}
              </span>
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

              <Link
                to="/client/contact"
                className={`font-medium transition-colors ${
                  isActive("/client/contact") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Contact Us
              </Link>

              <Link to="/client/notifications" className="relative hover:opacity-70 transition-opacity">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-white text-xs flex items-center justify-center">
                  3
                </span>
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
