"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "@/components/Client/Header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Settings, Fuel, Wind, ChevronDown, Calendar, DollarSign, X, CarIcon } from "lucide-react"
import ClientFooter from "@/components/Client/Footer"

export default function ReservationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<"pending" | "confirmed" | "ongoing" | "returned">("ongoing")

  // Mock data
  const reservation = {
    id: "#RES-12345",
    car: "Mercedes Sedan",
    price: 25,
    transmission: "Automat",
    fuel: "PB 95",
    ac: true,
    customer: {
      name: "Devon Lane",
      email: "john.smith@email.com",
      phone: "+1 234-567-8900",
      location: "Philadelphia, USA",
      revenue: "$101,345.00",
    },
    pickup: {
      date: "12 March 2025",
      time: "10:00 AM",
    },
    return: {
      date: "15 March 2025",
      time: "4:00 PM",
    },
    duration: "5 Days",
    payment: {
      rental: 120.0,
      paid: 50,
      onPickup: 70,
    },
  }

  const getStatusOptions = () => {
    switch (status) {
      case "pending":
        return ["Update", "Confirmed", "Ongoing", "Delete"]
      case "ongoing":
        return ["Update", "Returned", "Delete"]
      default:
        return ["Update", "Delete"]
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-8">Reservation details</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Car Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 border rounded-xl relative">
              <button className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors">
                <X className="w-5 h-5 text-red-500" />
              </button>

              <div className="w-full h-40 bg-muted rounded-lg mb-4 flex items-center justify-center">
                <CarIcon className="w-24 h-24 text-muted-foreground" />
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl">Mercedes</h3>
                  <p className="text-muted-foreground text-sm">Sedan</p>
                </div>
                <div className="text-right">
                  <p className="text-[#DC2626] font-bold text-xl">${reservation.price}</p>
                  <p className="text-muted-foreground text-xs">per day</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 flex-wrap">
                <div className="flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  <span>{reservation.transmission}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Fuel className="w-4 h-4" />
                  <span>{reservation.fuel}</span>
                </div>
                {reservation.ac && (
                  <div className="flex items-center gap-1">
                    <Wind className="w-4 h-4" />
                    <span>Air Conditioner</span>
                  </div>
                )}
              </div>

              <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                View Details
              </Button>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold">Status :</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className={`${
                      status === "pending"
                        ? "bg-orange-500 hover:bg-orange-600"
                        : status === "confirmed"
                          ? "bg-green-500 hover:bg-green-600"
                          : status === "ongoing"
                            ? "bg-[#DC2626] hover:bg-[#B71C1C]"
                            : "bg-gray-500 hover:bg-gray-600"
                    } text-white`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {getStatusOptions().map((option) => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => {
                        if (option === "Delete") {
                          // Handle delete
                          navigate("/client/reservations")
                        } else if (option !== "Update") {
                          setStatus(option.toLowerCase() as any)
                        }
                      }}
                    >
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Reservation ID */}
            <div>
              <p className="text-lg">
                <span className="font-semibold">Reservation ID:</span> {reservation.id}
              </p>
              <p className="text-lg">
                <span className="font-semibold">Car:</span> {reservation.car}
              </p>
            </div>

            {/* Date And Timing & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Date And Timing</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Pickup Date & Time:</span> {reservation.pickup.date} –{" "}
                    {reservation.pickup.time}
                  </p>
                  <p>
                    <span className="font-medium">Return Date & Time:</span> {reservation.return.date} –{" "}
                    {reservation.return.time}
                  </p>
                  <p>
                    <span className="font-medium">Duration :</span> {reservation.duration}
                  </p>
                </div>
              </Card>

              <Card className="p-6 border rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Payment</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Rental Price:</span> ${reservation.payment.rental.toFixed(2)}
                  </p>
                  <p>
                    <span className="font-medium">Paid By Card :</span> ${reservation.payment.paid} (30%)
                  </p>
                  <p>
                    <span className="font-medium">On Pick Up :</span> ${reservation.payment.onPickup}
                  </p>
                </div>
              </Card>
            </div>

            {/* Customer Information */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Customer information</h2>

              <div className="bg-card border rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-4 bg-muted/50 p-4 gap-4 font-medium text-sm">
                  <div className="flex items-center gap-2">
                    <span>Customer name</span>
                    <button className="text-muted-foreground">↕</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Contact</span>
                    <button className="text-muted-foreground">↕</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Location</span>
                    <button className="text-muted-foreground">↕</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>revenue</span>
                    <button className="text-muted-foreground">↕</button>
                  </div>
                </div>

                {/* Table Row */}
                <div className="grid grid-cols-4 p-4 gap-4">
                  <div>{reservation.customer.name}</div>
                  <div className="text-sm">
                    <p>{reservation.customer.email}</p>
                    <p>{reservation.customer.phone}</p>
                  </div>
                  <div>{reservation.customer.location}</div>
                  <div className="font-bold">{reservation.customer.revenue}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ClientFooter />
    </div>
  )
}
