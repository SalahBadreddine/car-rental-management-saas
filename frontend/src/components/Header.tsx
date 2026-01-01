"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import logo from "@/assets/logo.png"
import { logout } from "@/lib/auth"
import { useAuth } from "@/contexts/AuthContext"
import { useTenantOptional } from "@/contexts/TenantContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User, LogOut, Building2, LayoutDashboard } from "lucide-react"

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, clearAuth } = useAuth()
  
  // Get tenant context if available (null on pages like /browse, /signin)
  const tenantContext = useTenantOptional()
  const tenant = tenantContext?.tenant ?? null
  const tenantSlug = tenantContext?.tenantSlug ?? null

  // Build base path for tenant-aware navigation
  const basePath = tenantSlug ? `/${tenantSlug}` : ''

  const isActive = (path: string) => {
    const fullPath = basePath + path
    return location.pathname === fullPath || location.pathname.startsWith(fullPath + "/")
  }

  const handleLogout = () => {
    logout()
    clearAuth()
    navigate("/browse", { replace: true })
  }

  const isAuthPage = ["/signin", "/signup", "/forgot-password", "/reset-password", "/verify-email"].includes(location.pathname)
  const isBrowsePage = location.pathname === "/browse"
  const isAdminPage = location.pathname.startsWith("/admin") || location.pathname.startsWith("/client")

  // Don't show nav on auth pages
  if (isAuthPage) {
    return null
  }

  return (
    <header className="bg-muted/50 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to={basePath || "/browse"} className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
              {tenant?.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} className="h-8 w-auto object-contain" />
              ) : (
                <img src={logo || "/placeholder.svg"} alt="Logo" className="h-8" />
              )}
              <span className="font-heading font-bold text-xl">
                {tenant?.name || "RentoGo"}
              </span>
            </Link>

            {/* Main Navigation - Hidden on mobile, visible on tablet+ */}
            <nav className="hidden md:flex items-center gap-6">
              {tenantSlug && !isAdminPage && (
                <>
                  <Link
                    to={`${basePath}/vehicles`}
                    className={`font-medium text-sm transition-colors ${
                      isActive("/vehicles") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Vehicles
                  </Link>

                  <Link
                    to={`${basePath}/about`}
                    className={`font-medium text-sm transition-colors ${
                      isActive("/about") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    About Us
                  </Link>

                  <Link
                    to={`${basePath}/contact`}
                    className={`font-medium text-sm transition-colors ${
                      isActive("/contact") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Contact Us
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Auth state */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || ""} alt={user.full_name || ""} />
                      <AvatarFallback>{user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium leading-none">{user.full_name}</p>
                      <p className="w-[200px] truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {tenantSlug && (
                    <DropdownMenuItem asChild>
                      <Link to={`${basePath}/profile`} className="cursor-pointer w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {/* Show "Go to Dashboard" for tenant admins viewing end-user site */}
                  {(user.role === "client_admin" || user.role === "client") && !isAdminPage && (
                    <DropdownMenuItem asChild>
                      <Link to="/client/dashboard" className="cursor-pointer w-full">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Go to Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {/* "Switch Agency" link only if we are in a tenant context */}
                  {tenantSlug && (
                    <DropdownMenuItem asChild>
                      <Link to="/browse" className="cursor-pointer w-full">
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>Switch Agency</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                   {/* If on browse page, show generic Profile link if not already shown */}
                  {!tenantSlug && (
                     <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer w-full">
                         <User className="mr-2 h-4 w-4" />
                         <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/signin"
                  className="font-medium text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="font-medium text-sm bg-[#DC2626] text-white px-4 py-2 rounded-lg hover:bg-[#B71C1C] transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
