"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "@/components/Client/Header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { DollarSign, FileText, Settings, Wrench, CarIcon, Phone, Mail, MapPin, X, Wind, Loader2 } from "lucide-react"
import ClientFooter from "@/components/Client/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { dashboardApi } from "@/services/dashboardApi"
import { carsApi, type Car } from "@/services/carsApi"
import { reservationsApi, type Reservation } from "@/services/reservationsApi"


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 2,
  }).format(amount)
}


const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'
    case 'active':
    case 'ongoing':
      return 'bg-[#DC2626] text-white'
    case 'completed':
    case 'returned':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-gray-200 text-gray-700'
    default:
      return 'bg-gray-200 text-gray-700'
  }
}


const COLORS = ['#DC2626', '#2563EB', '#16A34A', '#F59E0B', '#8B5CF6', '#EC4899']

export default function ClientDashboard() {
  const navigate = useNavigate()
  const { user, selectedLocation } = useAuth()
  

  const [isLoading, setIsLoading] = useState(true)
  const [carStats, setCarStats] = useState<any>(null)
  const [reservationStats, setReservationStats] = useState<any>(null)
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([])
  const [featuredCars, setFeaturedCars] = useState<Car[]>([])
  const [categoryData, setCategoryData] = useState<{name: string, value: number, color: string}[]>([])
  const [statusData, setStatusData] = useState<{name: string, count: number}[]>([])


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [carStatsRes, reservationStatsRes, reservationsRes, carsRes] = await Promise.all([
          carsApi.getStatistics(selectedLocation || undefined),
          reservationsApi.getStatistics(selectedLocation || undefined),
          reservationsApi.getAll({ locationId: selectedLocation || undefined }),
          carsApi.getAllCars(selectedLocation || undefined),
        ])

        setCarStats(carStatsRes)
        setReservationStats(reservationStatsRes)
        setRecentReservations(reservationsRes.slice(0, 6))
        setFeaturedCars(carsRes.slice(0, 4))


        if (carStatsRes?.by_category) {
          const categories = Object.entries(carStatsRes.by_category).map(([name, value], index) => ({
            name,
            value: value as number,
            color: COLORS[index % COLORS.length],
          }))
          setCategoryData(categories)
        }


        if (carStatsRes?.by_status) {
          const statuses = Object.entries(carStatsRes.by_status).map(([name, count]) => ({
            name,
            count: count as number,
          }))
          setStatusData(statuses)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedLocation])

  const handleViewReservationDetails = (reservationId: string) => {
    navigate(`/client/reservations/${reservationId}`)
  }

  const handleViewVehicleDetails = (vehicleId: string) => {
    navigate(`/client/vehicles/${vehicleId}`)
  }


  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#DC2626]" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
        <ClientFooter />
      </div>
    )
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
              <p className="text-white/80 text-lg mb-6">{user?.full_name || user?.name || 'Admin'}</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#DC2626] rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Email</p>
                    <p className="text-white font-medium">{user?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            <Button asChild className="bg-[#DC2626] hover:bg-[#B71C1C] text-white">
              <Link to="/client/profile/edit">Edit Profile</Link>
            </Button>
          </div>
        </Card>


        <h2 className="text-4xl font-bold text-center mb-8">Dashboard Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          <Card className="p-6 border rounded-xl bg-white">
            <h3 className="font-bold mb-4">Cars by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>


          <Card className="p-6 border rounded-xl bg-white">
            <h3 className="font-bold mb-4">Cars by Category</h3>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {categoryData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm">{entry.name} ({entry.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No category data available
              </div>
            )}
          </Card>
        </div>


        <h3 className="text-3xl font-bold text-center mb-6">Recent Bookings</h3>
        <div className="space-y-2 mb-8">
          {recentReservations.length > 0 ? (
            recentReservations.map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                <div className="flex-1">
                  <p className="font-bold">
                    {reservation.car?.make} {reservation.car?.model || `Car #${reservation.car_id.slice(0, 8)}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {reservation.customer?.full_name || `Customer #${reservation.customer_id.slice(0, 8)}`}
                  </p>
                </div>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="font-bold">{formatCurrency(reservation.total_price)}</p>
                    <p className="text-sm text-muted-foreground">
                      {calculateDays(reservation.start_date, reservation.end_date)} Days
                    </p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-sm font-medium min-w-[120px] text-center ${getStatusColor(reservation.status)}`}>
                    {reservation.status}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-[80px] bg-transparent"
                    onClick={() => handleViewReservationDetails(reservation.id)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No reservations yet. Reservations will appear here once customers book vehicles.
            </div>
          )}
        </div>


        <h3 className="text-3xl font-bold text-center mb-6">Featured Cars</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {featuredCars.length > 0 ? (
            featuredCars.map((car) => (
              <Card key={car.id} className="p-4 border rounded-xl bg-white hover:shadow-lg transition-shadow">
                <div className="relative mb-3">
                  {car.primary_image_url ? (
                    <img
                      src={car.primary_image_url}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CarIcon className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mb-3">
                  <p className="font-bold">{car.make} {car.model}</p>
                  <p className="text-[#DC2626] font-bold">{formatCurrency(car.price_per_day)}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-1">per day</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Settings className="w-3 h-3" />
                  <span>{car.transmission || 'Auto'}</span>
                  <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                  <span>{car.fuel_type || 'Petrol'}</span>
                  <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                  <span>{car.seats || 5} seats</span>
                </div>
                <Button
                  onClick={() => handleViewVehicleDetails(car.id)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white text-sm"
                >
                  View Details
                </Button>
              </Card>
            ))
          ) : (
            <div className="col-span-4 text-center py-8 text-muted-foreground">
              No featured cars yet. Add cars and mark them as featured in the vehicle management.
            </div>
          )}
        </div>
      </main>

      <ClientFooter />
    </div>
  )
}
