"use client"

import { Link, useNavigate } from "react-router-dom"
import Header from "@/components/Client/Header"
import Footer from "@/components/Footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { DollarSign, FileText, Settings, Wrench, CarIcon, Phone, Mail, MapPin, X, Wind } from "lucide-react"

// Mock data
const revenueByMonth = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 6000 },
  { month: "Jun", revenue: 5500 },
  { month: "Jul", revenue: 7000 },
]

const revenueByBrand = [
  { brand: "Toyota", revenue: 8000 },
  { brand: "BMW", revenue: 6500 },
  { brand: "Mercedes", revenue: 7200 },
  { brand: "Ford", revenue: 4800 },
  { month: "Jun", revenue: 3500 },
  { month: "Jul", revenue: 4200 },
]

const rentalsByColor = [
  { name: "Black", value: 35, color: "#000000" },
  { name: "White", value: 25, color: "#FFFFFF" },
  { name: "Silver", value: 20, color: "#C0C0C0" },
  { name: "Red", value: 15, color: "#DC2626" },
  { name: "Blue", value: 5, color: "#2563EB" },
]

const brandData = [
  { name: "Toyota", logo: "/placeholder.svg", percentage: "30%" },
  { name: "Ford", logo: "/placeholder.svg", percentage: "15%" },
  { name: "BMW", logo: "/placeholder.svg", percentage: "30%" },
  { name: "Audi", logo: "/placeholder.svg", percentage: "10%" },
  { name: "Mercedes", logo: "/placeholder.svg", percentage: "30%" },
]

const recentBookings = [
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    price: "$720",
    days: "4 Days",
    status: "not returned",
  },
  { id: "#RES-12346", car: "BMW 5 Series", customer: "John Smith", price: "$720", days: "4 Days", status: "returned" },
  { id: "#RES-12347", car: "BMW 5 Series", customer: "John Smith", price: "$720", days: "4 Days", status: "ongoing" },
  { id: "#RES-12348", car: "BMW 5 Series", customer: "John Smith", price: "$720", days: "4 Days", status: "returned" },
  { id: "#RES-12349", car: "BMW 5 Series", customer: "John Smith", price: "$720", days: "4 Days", status: "returned" },
  { id: "#RES-12350", car: "BMW 5 Series", customer: "John Smith", price: "$720", days: "4 Days", status: "confirmed" },
]

const mostRentedCars = [
  { id: 1, name: "Mercedes", price: "$25", image: "/placeholder.svg" },
  { id: 2, name: "Mercedes", price: "$25", image: "/placeholder.svg" },
  { id: 3, name: "Mercedes", price: "$25", image: "/placeholder.svg" },
  { id: 4, name: "Mercedes", price: "$25", image: "/placeholder.svg" },
]

export default function ClientDashboard() {
  const navigate = useNavigate()

  const handleViewReservationDetails = (reservationId: string) => {
    navigate(`/client/reservations/${reservationId.replace("#", "")}`)
  }

  const handleViewVehicleDetails = (vehicleId: number) => {
    navigate(`/client/vehicles/${vehicleId}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="bg-black text-white p-8 mb-8 rounded-2xl relative overflow-hidden">
          <div
            className="absolute right-0 top-0 bottom-0 w-2/3 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 Q 25 25 50 0 T 100 0' stroke='%23ffffff' strokeWidth='2' fill='none'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
            }}
          />
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">Personal Information :</h2>
              <p className="text-white/80 text-lg mb-6">RentoGo</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#DC2626] rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Phone</p>
                    <p className="text-white font-medium">+537 547-6401</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#DC2626] rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Email</p>
                    <p className="text-white font-medium">nwiger@yahoo.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#DC2626] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Address</p>
                    <p className="text-white font-medium">Oxford Ave. Cary, NC 27511</p>
                  </div>
                </div>
              </div>
            </div>
            <Button asChild className="bg-[#DC2626] hover:bg-[#B71C1C] text-white">
              <Link to="/client/profile/edit">List Edit</Link>
            </Button>
          </div>
        </Card>

        {/* Dashboard Overview */}
        <h2 className="text-4xl font-bold text-center mb-8">Dashboard Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Revenue */}
          <Card className="p-6 border rounded-xl bg-white">
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">$101,345.00</p>
              </div>
            </div>
            <p className="text-sm text-green-600">+24% From Last Month</p>
          </Card>

          {/* Total Paid */}
          <Card className="p-6 border rounded-xl bg-white">
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold mt-1">$51,654.98</p>
              </div>
            </div>
            <p className="text-sm text-green-600">+14% From Last Month</p>
          </Card>

          {/* Proxy Parking Range */}
          <Card className="p-6 border rounded-xl bg-white">
            <div className="mb-2">
              <p className="text-sm text-muted-foreground mb-3">Proxy Parking Range</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Min 1Day:</span>
                  <span className="font-bold">80%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Over 3Ds:</span>
                  <span className="font-bold">45%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Booking Confirmed */}
          <Card className="p-6 border rounded-xl bg-white">
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Booking Confirmed</p>
                <p className="text-2xl font-bold mt-1">5 Total Companies</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">+5% From Last Month</p>
          </Card>

          {/* Active Rentals */}
          <Card className="p-6 border rounded-xl bg-white">
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Active Rentals</p>
                <p className="text-2xl font-bold mt-1">Currently Ongoing</p>
                <p className="text-xs text-muted-foreground mt-1">out of 4000 Lands</p>
              </div>
            </div>
          </Card>

          {/* Maintenance Required */}
          <Card className="p-6 border rounded-xl bg-white">
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Wrench className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Maintenance Required</p>
                <p className="text-2xl font-bold mt-1">Anytime</p>
                <p className="text-xs text-muted-foreground mt-1">Aug 08</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue per month */}
          <Card className="p-6 border rounded-xl bg-white">
            <h3 className="font-bold mb-4">Revenue per month</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue per brand */}
          <Card className="p-6 border rounded-xl bg-white">
            <h3 className="font-bold mb-4">Revenue per brand</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueByBrand}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="brand" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Occupancy per month */}
          <Card className="p-6 border rounded-xl bg-white">
            <h3 className="font-bold mb-4">Occupancy per month</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#6B7280" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Reservation per brand */}
          <Card className="p-6 border rounded-xl bg-white">
            <h3 className="font-bold mb-4">Reservation per brand</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueByBrand}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="brand" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#6B7280" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Rentals per color (pie chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border rounded-xl bg-white">
            <h3 className="font-bold mb-4">Rentals Per Color</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={rentalsByColor}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rentalsByColor.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {rentalsByColor.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Rentals per brand */}
          <Card className="p-6 border rounded-xl bg-white">
            <h3 className="font-bold mb-4 text-center">Rentals per brand</h3>
            <div className="flex justify-around items-center h-[250px]">
              {brandData.map((brand, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <CarIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-bold text-lg text-[#DC2626]">{brand.percentage}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Bookings */}
        <h3 className="text-3xl font-bold text-center mb-6">Recent Bookings</h3>
        <div className="space-y-2 mb-8">
          {recentBookings.map((booking, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-lg">
              <div className="flex-1">
                <p className="font-bold">{booking.car}</p>
                <p className="text-sm text-muted-foreground">{booking.customer}</p>
              </div>
              <div className="flex items-center gap-8">
                <div>
                  <p className="font-bold">{booking.price}</p>
                  <p className="text-sm text-muted-foreground">{booking.days}</p>
                </div>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-medium min-w-[120px] text-center ${
                    booking.status === "not returned"
                      ? "bg-gray-200 text-gray-700"
                      : booking.status === "returned"
                        ? "bg-gray-200 text-gray-700"
                        : booking.status === "ongoing"
                          ? "bg-[#DC2626] text-white"
                          : "bg-[#DC2626] text-white"
                  }`}
                >
                  {booking.status}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[80px] bg-transparent"
                  onClick={() => handleViewReservationDetails(booking.id)}
                >
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Most rented */}
        <h3 className="text-3xl font-bold text-center mb-6">Most rented</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {mostRentedCars.map((car) => (
            <Card key={car.id} className="p-4 border rounded-xl bg-white hover:shadow-lg transition-shadow">
              <div className="relative mb-3">
                <button className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors">
                  <X className="w-4 h-4 text-red-500" />
                </button>
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CarIcon className="w-20 h-20 text-gray-300" />
                </div>
              </div>
              <div className="flex justify-between items-center mb-3">
                <p className="font-bold">{car.name}</p>
                <p className="text-[#DC2626] font-bold">{car.price}</p>
              </div>
              <p className="text-xs text-muted-foreground mb-1">per day</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Settings className="w-3 h-3" />
                <span>Automat</span>
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                <span>PB 95</span>
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                <Wind className="w-3 h-3" />
              </div>
              <Button
                onClick={() => handleViewVehicleDetails(car.id)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white text-sm"
              >
                View Details
              </Button>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
