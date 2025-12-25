"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "@/components/Client/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Fuel, Wind, Users, Gauge, CarIcon, Check } from "lucide-react"
import ClientFooter from "@/components/Client/Footer"

export default function AddVehicle() {
  const navigate = useNavigate()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [equipment, setEquipment] = useState({
    abs: true,
    airBags: false,
    cruiseControl: false,
    airConditioner: false,
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8">Add cars for renting</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input placeholder="Name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Price</label>
                  <Input type="number" placeholder="00" />
                  <span className="text-xs text-muted-foreground">$/day</span>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Brand</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bmw">BMW</SelectItem>
                      <SelectItem value="mercedes">Mercedes</SelectItem>
                      <SelectItem value="toyota">Toyota</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Car Image */}
            <Card className="p-6 border rounded-xl">
              <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                <CarIcon className="w-32 h-32 text-muted-foreground" />
              </div>

              {/* Image Gallery */}
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-muted rounded-lg" />
                <div className="aspect-square bg-muted rounded-lg" />
                <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground text-3xl cursor-pointer hover:bg-muted transition-colors">
                  +
                </div>
              </div>
            </Card>

            {/* Availability */}
            <div>
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
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Technical Specification */}
            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-6">Technical Specification</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-center mb-2">
                    <Settings className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-2 text-center">Gear Box</p>
                  <Input placeholder="..." className="text-center" />
                </div>
                <div>
                  <div className="flex justify-center mb-2">
                    <Fuel className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-2 text-center">Fuel</p>
                  <Input placeholder="..." className="text-center" />
                </div>
                <div>
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
                  <p className="font-medium mb-2 text-center">Doors</p>
                  <Input type="number" placeholder="0" className="text-center" />
                </div>
                <div>
                  <div className="flex justify-center mb-2">
                    <Wind className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-2 text-center">Air Conditioner</p>
                  <Input placeholder="Yes/No" className="text-center" />
                </div>
                <div>
                  <div className="flex justify-center mb-2">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-2 text-center">Seats</p>
                  <Input type="number" placeholder="3" className="text-center" />
                </div>
                <div>
                  <div className="flex justify-center mb-2">
                    <Gauge className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-2 text-center">Distance</p>
                  <Input placeholder="0" className="text-center" />
                </div>
              </div>
            </Card>

            {/* Car Equipment */}
            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-4">Car Equipment</h3>
              <div className="grid grid-cols-2 gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${equipment.abs ? "bg-[#DC2626]" : "bg-gray-300"}`}
                  >
                    {equipment.abs && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span>ABS</span>
                  <input
                    type="checkbox"
                    checked={equipment.abs}
                    onChange={(e) => setEquipment({ ...equipment, abs: e.target.checked })}
                    className="sr-only"
                  />
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${equipment.airBags ? "bg-[#DC2626]" : "bg-gray-300"}`}
                  >
                    {equipment.airBags && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span>Air Bags</span>
                  <input
                    type="checkbox"
                    checked={equipment.airBags}
                    onChange={(e) => setEquipment({ ...equipment, airBags: e.target.checked })}
                    className="sr-only"
                  />
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${equipment.cruiseControl ? "bg-[#DC2626]" : "bg-gray-300"}`}
                  >
                    {equipment.cruiseControl && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span>Cruise Control</span>
                  <input
                    type="checkbox"
                    checked={equipment.cruiseControl}
                    onChange={(e) => setEquipment({ ...equipment, cruiseControl: e.target.checked })}
                    className="sr-only"
                  />
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${equipment.airConditioner ? "bg-[#DC2626]" : "bg-gray-300"}`}
                  >
                    {equipment.airConditioner && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span>Air Conditioner</span>
                  <input
                    type="checkbox"
                    checked={equipment.airConditioner}
                    onChange={(e) => setEquipment({ ...equipment, airConditioner: e.target.checked })}
                    className="sr-only"
                  />
                </label>
              </div>
            </Card>

            {/* Color */}
            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-4">Color</h3>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={() => navigate("/client/vehicles")}
              className="w-full bg-[#DC2626] hover:bg-[#B71C1C] text-white h-12 text-lg"
            >
              Available
            </Button>
          </div>
        </div>
      </main>

      <ClientFooter />
    </div>
  )
}
