"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "@/components/Client/Header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Settings, Fuel, Wind, ChevronDown, Calendar, DollarSign, CarIcon, Loader2, User, MapPin, Clock, Phone } from "lucide-react"
import ClientFooter from "@/components/Client/Footer"
import { reservationsApi, type Reservation } from "@/services/reservationsApi"
import { carsApi, type Car } from "@/services/carsApi"
import { useToast } from "@/hooks/use-toast"


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 2,
  }).format(amount).replace('DZD', 'DA')
}


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}


const calculateDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}


const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-gray-200 text-gray-700'
    default:
      return 'bg-gray-200 text-gray-700'
  }
}

export default function ReservationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [car, setCar] = useState<Car | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)


  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      
      setIsLoading(true)
      try {
        const reservationData = await reservationsApi.getById(id)
        if (reservationData) {
          setReservation(reservationData)
          

          if (reservationData.car_id) {
            const carData = await carsApi.getCarById(reservationData.car_id)
            setCar(carData)
          }
        }
      } catch (error) {
        console.error('Error fetching reservation:', error)
        toast({
          title: "Error",
          description: "Failed to load reservation details.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])


  const handleStatusUpdate = async (newStatus: string) => {
    if (!id || !reservation) return

    setIsUpdating(true)
    try {
      const updated = await reservationsApi.updateStatus(id, newStatus)
      if (updated) {
        setReservation({ ...reservation, status: newStatus as any })
        toast({
          title: "Success",
          description: `Reservation status updated to ${newStatus}.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reservation status.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }


  const handleCancel = async () => {
    if (!id || !confirm('Are you sure you want to cancel this reservation?')) return

    setIsUpdating(true)
    try {
      const success = await reservationsApi.cancel(id)
      if (success) {
        toast({
          title: "Success",
          description: "Reservation cancelled successfully.",
        })
        navigate('/client/reservations')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel reservation.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }


  const getStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return ["confirmed", "cancelled"]
      case "confirmed":
        return ["completed", "cancelled"]
      case "completed":
      case "cancelled":
        return [] // No transitions from final states
      default:
        return []
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#DC2626]" />
        </main>
        <ClientFooter />
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <Calendar className="w-20 h-20 text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Reservation Not Found</h2>
          <p className="text-muted-foreground mb-6">The reservation you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/client/reservations')}>Back to Reservations</Button>
        </main>
        <ClientFooter />
      </div>
    )
  }

  const days = calculateDays(reservation.start_date, reservation.end_date)
  const statusOptions = getStatusOptions(reservation.status)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Reservation Details</h1>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(reservation.status)}`}>
            {reservation.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-1">
            <Card className="p-6 border rounded-xl">
              <div className="w-full h-40 bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {car?.primary_image_url ? (
                  <img 
                    src={car.primary_image_url} 
                    alt={`${car.make} ${car.model}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CarIcon className="w-24 h-24 text-muted-foreground" />
                )}
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl">
                    {car ? `${car.make} ${car.model}` : `Car #${reservation.car_id.slice(0, 8)}`}
                  </h3>
                  <p className="text-muted-foreground">{car?.category || 'Vehicle'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#DC2626] font-bold text-xl">
                    {formatCurrency(car?.price_per_day || 0)}
                  </p>
                  <p className="text-muted-foreground text-sm">/ day</p>
                </div>
              </div>


              {car && (
                <div className="flex justify-around py-4 border-t border-b mb-4">
                  <div className="text-center">
                    <Settings className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">{car.transmission || 'Auto'}</p>
                  </div>
                  <div className="text-center">
                    <Fuel className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">{car.fuel_type || 'Petrol'}</p>
                  </div>
                  <div className="text-center">
                    <Wind className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">{car.seats || 5} seats</p>
                  </div>
                </div>
              )}

              <Button
                onClick={() => car && navigate(`/client/vehicles/${car.id}`)}
                variant="outline"
                className="w-full"
                disabled={!car}
              >
                View Vehicle
              </Button>
            </Card>
          </div>


          <div className="lg:col-span-2 space-y-6">

            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">
                    {reservation.customer?.full_name || `Customer #${reservation.customer_id.slice(0, 8)}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer ID</p>
                  <p className="font-medium font-mono text-sm">{reservation.customer_id.slice(0, 8)}...</p>
                </div>
                <div className="col-span-2 pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    Phone Number
                  </p>
                  <p className="font-medium">
                    {reservation.customer?.phone_number || "Not provided"}
                  </p>
                </div>
              </div>
            </Card>


            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Rental Period
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium mb-1">Pick-Up Date</p>
                  <p className="font-bold">{formatDate(reservation.start_date)}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 font-medium mb-1">Return Date</p>
                  <p className="font-bold">{formatDate(reservation.end_date)}</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold">{days} Days</p>
              </div>
            </Card>


            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Rate</span>
                  <span>{formatCurrency(car?.price_per_day || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{days} days</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-xl text-[#DC2626]">
                    {formatCurrency(reservation.total_price)}
                  </span>
                </div>
              </div>
            </Card>


            {reservation.notes && (
              <Card className="p-6 border rounded-xl">
                <h3 className="font-bold text-xl mb-4">Notes</h3>
                <p className="text-muted-foreground">{reservation.notes}</p>
              </Card>
            )}


            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-4">Actions</h3>
              <div className="flex gap-4">
                {statusOptions.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        className="bg-[#DC2626] hover:bg-[#B71C1C] text-white"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Update Status
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {statusOptions.map((status) => (
                        <DropdownMenuItem 
                          key={status}
                          onClick={() => handleStatusUpdate(status)}
                          className="capitalize"
                        >
                          Mark as {status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Cancel Reservation
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/client/reservations')}
                >
                  Back to List
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <ClientFooter />
    </div>
  )
}
