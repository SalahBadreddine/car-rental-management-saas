"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import heroCar from "@/assets/car_home.png"
import traceCar from "@/assets/car_trace.png"
import HeroBackground from "@/components/HeroBackground"
import { Store, Users } from "lucide-react"
import logo from "@/assets/logo.png"

const RoleSelection = () => {
  const navigate = useNavigate()
  const { userRole, user } = useAuth()

  useEffect(() => {
    if (user && userRole) {
      if (userRole === "client") {
        navigate("/client/location-select", { replace: true })
      } else {
        navigate("/enduser", { replace: true })
      }
    }
  }, [user, userRole, navigate])

  const handleClientRole = () => {
    navigate("/signin?role=client")
  }

  const handleUserRole = () => {
    navigate("/signin?role=enduser")
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-muted/50 sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logo || "/placeholder.svg"} alt="RentoGo Logo" className="h-8" />
              <span className="font-bold text-xl">RentoGo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Role Selection */}
      <HeroBackground trace={traceCar} car={heroCar}>
        <div className="max-w-2xl w-full">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Welcome to <span className="text-primary">RentoGo</span>
          </h2>
          <p className="text-lg text-white/80 mb-12">Choose how you want to experience our car rental platform</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Card */}
            <Card className="p-8 bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/40 transition-all cursor-pointer hover:bg-white/20 group">
              <div className="h-full flex flex-col" onClick={handleClientRole}>
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Store className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Rental Store Owner</h3>
                <p className="text-white/70 mb-6 flex-grow">
                  Manage your fleet, track reservations, and grow your rental business
                </p>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClientRole()
                  }}
                >
                  Continue as Store Owner
                </Button>
              </div>
            </Card>

            {/* End User Card */}
            <Card className="p-8 bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/40 transition-all cursor-pointer hover:bg-white/20 group">
              <div className="h-full flex flex-col" onClick={handleUserRole}>
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Customer</h3>
                <p className="text-white/70 mb-6 flex-grow">
                  Browse available cars, make reservations, and enjoy affordable rentals
                </p>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUserRole()
                  }}
                >
                  Continue as Customer
                </Button>
              </div>
            </Card>
          </div>

          <div className="mt-8 p-4 bg-white/5 border border-white/20 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-white/60 text-center">
              Note: This page is for testing purposes to demonstrate both the Store Owner and Customer interfaces. In
              production, users will access their respective portals directly via their login links.
            </p>
          </div>
        </div>
      </HeroBackground>
    </div>
  )
}

export default RoleSelection
