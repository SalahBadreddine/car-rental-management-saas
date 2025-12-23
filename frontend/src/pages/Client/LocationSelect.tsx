"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { CLIENT_LOCATIONS } from "@/lib/locations"
import heroCar from "@/assets/car_home.png"
import traceCar from "@/assets/car_trace.png"
import HeroBackground from "@/components/HeroBackground"
import { MapPin, Car, Calendar } from "lucide-react"
import Header from "@/components/Client/Header"
import Footer from "@/components/Footer"

const LocationSelect = () => {
  const navigate = useNavigate()
  const { setSelectedLocation, selectedLocation } = useAuth()

  useEffect(() => {
    if (selectedLocation) {
      navigate("/client/home", { replace: true })
    }
  }, [selectedLocation, navigate])

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId)
    navigate("/client/home", { replace: true })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />

        <HeroBackground trace={traceCar} car={heroCar}>
          <div className="w-full max-w-5xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Select Your Location</h1>
            <p className="text-lg text-white/80 mb-10">Choose which rental location you want to manage today</p>

            {/* Location Selection Grid - Now in Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CLIENT_LOCATIONS.map((location) => (
                <Card
                  key={location.id}
                  className="p-6 bg-white/10 backdrop-blur-sm border-white/30 hover:border-white/60 transition-all cursor-pointer hover:bg-white/20 hover:shadow-xl flex flex-col h-full"
                  onClick={() => handleLocationSelect(location.id)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{location.name}</h3>
                  </div>

                  <p className="text-white/80 mb-4 flex-grow text-sm">{location.address}</p>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-primary" />
                      <span className="text-sm text-white/90">
                        <strong>{location.vehicles}</strong> vehicles
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm text-white/90">
                        <strong>{location.reservations}</strong> reservations
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLocationSelect(location.id)
                    }}
                  >
                    Access {location.name}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </HeroBackground>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}

export default LocationSelect
