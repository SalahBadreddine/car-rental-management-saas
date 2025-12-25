"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import logo from "@/assets/logo.png"
import { logout } from "@/lib/auth"
import { useAuth } from "@/contexts/AuthContext"

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, clearAuth } = useAuth()

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/")

  const handleLogout = () => {
    logout()
    clearAuth()
    navigate("/role-select", { replace: true })
  }

  const hideNav = ["/signin", "/signup", "/role-select"].includes(location.pathname)

  return (
    <header className="bg-muted/50 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
            <img src={logo || "/placeholder.svg"} alt="Logo" className="h-8" />
            <span className="font-heading font-bold text-xl">RentoGo</span>
          </Link>

          {!hideNav && (
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/enduser/vehicles"
                className={`font-medium transition-colors ${
                  isActive("/enduser/vehicles") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Vehicles
              </Link>

              <Link
                to="/enduser/about"
                className={`font-medium transition-colors ${
                  isActive("/enduser/about") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                About Us
              </Link>

              <Link
                to="/enduser/contact"
                className={`font-medium transition-colors ${
                  isActive("/enduser/contact") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Contact Us
              </Link>

              {user ? (
                <>
                  <Link
                    to="/enduser/profile"
                    className={`font-medium transition-colors ${
                      isActive("/enduser/profile") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="font-medium text-red-500 hover:text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className={`font-medium transition-colors ${
                      isActive("/signin") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className={`font-medium transition-colors ${
                      isActive("/signup") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
