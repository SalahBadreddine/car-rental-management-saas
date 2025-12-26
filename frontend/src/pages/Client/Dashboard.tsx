"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "@/components/Client/Header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { DollarSign, FileText, Settings, Wrench, CarIcon, Phone, Mail, MapPin } from "lucide-react"
import ClientFooter from "@/components/Client/Footer"
import { fetchDashboardStats, type DashboardStats } from "@/services/dashboardApi"

export default function ClientDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchDashboardStats()
        setStats(data)
      } catch (err) {
        console.error("Failed to load dashboard stats:", err)
        setError("Failed to load dashboard statistics. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const handleViewReservationDetails = (reservationId: string) => {
    navigate(`/client/reservations/${reservationId.replace("#", "")}`)
  }

  const handleViewVehicleDetails = (vehicleId: number) => {
    navigate(`/client/vehicles/${vehicleId}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
        <ClientFooter />
      </div>
    )
  }

  // Error state
  if (error || !stats) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Failed to load dashboard"}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </main>
        <ClientFooter />
      </div>
    )
  }

  // Chart colors for pie chart
  const COLORS = ['#000000', '#FFFFFF', '#C0C0C0', '#DC2626', '#2563EB']

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Personal Information Card - Keep as is */}
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
                <p className="text-2xl font-bold mt-1">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-sm text-green-600">From completed rentals</p>
          </Card>

          {/* Occupancy Rate - NEW */}
          <Card className="p-6 border rounded-xl bg-white">
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CarIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold mt-1">{stats.occupancyRate}%</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.totalCars - stats.availableCars} of {stats.totalCars} cars rented
            </p>
          </Card>

          {/* Proxy Parking Range - Keep dummy data */}
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

          {/* Total Reservations */}
          <Card className="p-6 border rounded-xl bg-white">
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Reservations</p>
                <p className="text-2xl font-bold mt-1">{stats.totalReservations}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{stats.pendingReservations} pending</p>
          </Card>

          {/* Booking Confirmed - Keep existing */}
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

          {/* Maintenance Required - Keep existing */}
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
          {/* Revenue per month - REAL DATA */}
          <Card className="p-6 border rounded-xl bg-white">
            <h3 className="font-bold mb-4">Revenue per month</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue per brand - REAL DATA */}
          <Card className="p-6 border rounded-xl bg-white">
            <h3 className="font-bold mb-4">Revenue per brand</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.revenueByBrand}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="brand" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Occupancy per month - Keep with dummy data */}
          <Card className="p-6 border rounded-xl bg-white">
            <h3 className="font-bold mb-4">Occupancy per month</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#6B7280" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Reservation per brand - Keep with dummy data */}
          <Card className="p-6 border rounded-xl bg-white">
            <h3 className="font-bold mb-4">Reservation per brand</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.revenueByBrand}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="brand" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#6B7280" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Rentals per color (pie chart) - REAL DATA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border rounded-xl bg-white">
            <h3 className="font-bold mb-4">Rentals Per Color</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.rentalsByColor}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.rentalsByColor.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {stats.rentalsByColor.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Rentals per brand - Keep existing */}
          <Card className="p-6 border rounded-xl bg-white">
            <h3 className="font-bold mb-4 text-center">Rentals per brand</h3>
            <div className="flex justify-around items-center h-[250px]">
              {["Toyota", "Ford", "BMW", "Audi", "Mercedes"].map((brand, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <CarIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-bold text-lg text-[#DC2626]">{Math.floor(Math.random() * 30 + 10)}%</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Bookings - Keep existing structure */}
        <h3 className="text-3xl font-bold text-center mb-6">Recent Bookings</h3>
        <div className="space-y-2 mb-8">
          {stats.recentReservations.slice(0, 6).map((booking, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-lg">
              <div className="flex-1">
                <p className="font-bold">{booking.cars?.make || "Unknown"} {booking.cars?.model || ""}</p>
                <p className="text-sm text-muted-foreground">{booking.profiles?.full_name || "Customer"}</p>
              </div>
              <div className="flex items-center gap-8">
                <div>
                  <p className="font-bold">${booking.total_price}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-medium min-w-[120px] text-center ${
                    booking.status === "pending"
                      ? "bg-gray-200 text-gray-700"
                      : booking.status === "confirmed"
                        ? "bg-[#DC2626] text-white"
                        : "bg-gray-200 text-gray-700"
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

        {/* Most rented - REAL DATA */}
        <h3 className="text-3xl font-bold text-center mb-6">Most rented</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.mostRentedCars.map((car) => (
            <Card key={car.id} className="p-4 border rounded-xl bg-white hover:shadow-lg transition-shadow">
              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                {car.primary_image_url ? (
                  <img src={car.primary_image_url} alt={`${car.make} ${car.model}`} className="h-full object-contain" />
                ) : (
                  <CarIcon className="w-20 h-20 text-gray-300" />
                )}
              </div>
              <div className="flex justify-between items-center mb-3">
                <p className="font-bold">{car.make}</p>
                <p className="text-[#DC2626] font-bold">${car.price_per_day}</p>
              </div>
              <p className="text-xs text-muted-foreground mb-1">per day</p>
              <p className="text-xs text-muted-foreground mb-3">Rented {car.rental_count} times</p>
              <Button
                onClick={() => handleViewVehicleDetails(parseInt(car.id))}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white text-sm"
              >
                View Details
              </Button>
            </Card>
          ))}
        </div>
      </main>

      <ClientFooter />
    </div>
  )
}
