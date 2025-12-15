"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "@/components/Client/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Settings, Fuel, Wind, Users, Gauge, CarIcon, Check } from "lucide-react"

export default function ClientVehicleDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Mock data
  const vehicle = {
    id: 1,
    name: "BMW",
    type: "Sedan",
    price: 25,
    status: "Available",
    specs: {
      gearBox: "Automat",
      fuel: "Petrol",
      doors: "2",
      ac: "Yes",
      seats: "5",
      distance: "8KM",
    },
    equipment: ["ABS", "Air Bags", "Cruise Control", "Air Conditioner"],
    color: "Black",
    occupancy: 80,
  }

  const bookings = [
    { car: "BMW 5 Series", customer: "John Smith", days: "-4 Days", status: "ongoing" },
    { car: "BMW 5 Series", customer: "John Smith", days: "+5 Days", status: "confirmed" },
    { car: "BMW 5 Series", customer: "John Smith", days: "+8 Days", status: "confirmed" },
  ]

  const reservationHistory = [
    {
      customer: "Devon Lane",
      contact: { email: "john.smith@email.com", phone: "+1 234-567-8900" },
      location: "Philadelphia, USA",
      pickupDate: "12/03/2025",
      returnDate: "20/03/2025",
      revenue: "$101,345.00",
    },
    {
      customer: "Kathryn Murphy",
      contact: { email: "sarah.j@email.com", phone: "+1 234-567-8901" },
      location: "Los Angeles, USA",
      pickupDate: "12/03/2025",
      returnDate: "12/04/2025",
      revenue: "$2,400.98",
    },
    {
      customer: "Eleanor Pena",
      contact: { email: "michael.brown@email.com", phone: "+1 234-567-8902" },
      location: "Manhattan, USA",
      pickupDate: "12/03/2025",
      returnDate: "10/06/2025",
      revenue: "$56,987.00",
    },
    {
      customer: "Annette Black",
      contact: { email: "michael.brown@email.com", phone: "+1 234-567-8902" },
      location: "Toronto, CA",
      pickupDate: "12/03/2025",
      returnDate: "12/03/2025",
      revenue: "$12,567.90",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Car Card */}
            <Card className="p-6 border rounded-xl relative">
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {vehicle.status}
              </div>

              <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center mt-8">
                <CarIcon className="w-32 h-32 text-muted-foreground" />
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-2xl">{vehicle.name}</h3>
                  <p className="text-muted-foreground">{vehicle.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#DC2626] font-bold text-2xl">${vehicle.price}</p>
                  <p className="text-muted-foreground text-sm">/ day</p>
                </div>
              </div>

              {/* Image Gallery */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="aspect-square bg-muted rounded-lg" />
                <div className="aspect-square bg-muted rounded-lg" />
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-2xl">
                  +
                </div>
              </div>

              {/* Availability */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Availability</h4>
                  <button className="text-sm text-muted-foreground">›</button>
                </div>
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border w-full" />
                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Always available</span>
                  </label>
                </div>
              </div>

              {/* Occupancy */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Occupancy Of This Month</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-black" style={{ width: `${vehicle.occupancy}%` }} />
                  </div>
                  <span className="font-bold">{vehicle.occupancy}%</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Technical Specification */}
            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-6">Technical Specification</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Settings className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">Gear Box</p>
                  <p className="text-muted-foreground">{vehicle.specs.gearBox}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Fuel className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">Fuel</p>
                  <p className="text-muted-foreground">{vehicle.specs.fuel}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <svg
                      className="w-8 h-8 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <p className="font-medium mb-1">Doors</p>
                  <p className="text-muted-foreground">{vehicle.specs.doors}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Wind className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">Air Conditioner</p>
                  <p className="text-muted-foreground">{vehicle.specs.ac}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">Seats</p>
                  <p className="text-muted-foreground">{vehicle.specs.seats}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Gauge className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">Distance</p>
                  <p className="text-muted-foreground">{vehicle.specs.distance}</p>
                </div>
              </div>
            </Card>

            {/* Car Equipment */}
            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-4">Car Equipment</h3>
              <div className="grid grid-cols-2 gap-4">
                {vehicle.equipment.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#DC2626] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Color */}
            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-4">Color</h3>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-black border-2 border-gray-300" />
                <span>{vehicle.color}</span>
              </div>
            </Card>

            {/* Bookings */}
            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-4">Bookings</h3>
              <div className="space-y-3">
                {bookings.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <p className="font-bold">{booking.car}</p>
                      <p className="text-sm text-muted-foreground">{booking.customer}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">{booking.days}</span>
                      <span
                        className={`px-4 py-1 rounded-full text-sm font-medium ${
                          booking.status === "ongoing" ? "bg-[#DC2626] text-white" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#DC2626] text-white hover:bg-[#B71C1C] border-0"
                      >
                        delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Edit Button */}
            <Button
              onClick={() => navigate(`/client/vehicles/${id}/edit`)}
              className="w-full bg-[#DC2626] hover:bg-[#B71C1C] text-white h-12 text-lg"
            >
              Edit
            </Button>

            {/* Reservations History */}
            <div>
              <h3 className="font-bold text-2xl mb-4">Reservations History</h3>
              <div className="bg-card border rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-6 bg-muted/50 p-4 gap-4 font-medium text-sm">
                  <div>Customer name</div>
                  <div>Contact</div>
                  <div>Location</div>
                  <div>date of pickup</div>
                  <div>date of return</div>
                  <div>revenue</div>
                </div>

                {/* Table Rows */}
                {reservationHistory.map((res, index) => (
                  <div key={index} className="grid grid-cols-6 p-4 gap-4 border-t text-sm">
                    <div>{res.customer}</div>
                    <div className="text-xs">
                      <p>{res.contact.email}</p>
                      <p>{res.contact.phone}</p>
                    </div>
                    <div>{res.location}</div>
                    <div>{res.pickupDate}</div>
                    <div>{res.returnDate}</div>
                    <div className="font-bold">{res.revenue}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
