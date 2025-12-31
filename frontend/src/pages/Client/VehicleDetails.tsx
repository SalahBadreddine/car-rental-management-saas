"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "@/components/Client/Header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Settings, Fuel, Wind, Users, Gauge, CarIcon, Check, Loader2, Trash2 } from "lucide-react"
import ClientFooter from "@/components/Client/Footer"
import { carsApi, type Car } from "@/services/carsApi"
import { reservationsApi, type Reservation } from "@/services/reservationsApi"
import { useToast } from "@/hooks/use-toast"


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 2,
  }).format(amount)
}


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function ClientVehicleDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [vehicle, setVehicle] = useState<Car | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])


  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      
      setIsLoading(true)
      try {
        const [carData, reservationsData] = await Promise.all([
          carsApi.getCarById(id),
          reservationsApi.getByCarId(id),
        ])
        
        setVehicle(carData)
        setReservations(reservationsData)
      } catch (error) {
        console.error('Error fetching vehicle:', error)
        toast({
          title: "Error",
          description: "Failed to load vehicle details.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])


  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this vehicle?')) return

    try {
      const success = await carsApi.deleteCar(id)
      if (success) {
        toast({
          title: "Success",
          description: "Vehicle deleted successfully.",
        })
        navigate('/client/vehicles')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vehicle.",
        variant: "destructive",
      })
    }
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 text-white'
      case 'rented':
        return 'bg-blue-500 text-white'
      case 'maintenance':
        return 'bg-yellow-500 text-white'
      default:
        return 'bg-gray-500 text-white'
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

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <CarIcon className="w-20 h-20 text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Vehicle Not Found</h2>
          <p className="text-muted-foreground mb-6">The vehicle you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/client/vehicles')}>Back to Vehicles</Button>
        </main>
        <ClientFooter />
      </div>
    )
  }

  // Parse features if it's a string
  const features = Array.isArray(vehicle.features) 
    ? vehicle.features 
    : (typeof vehicle.features === 'string' ? JSON.parse(vehicle.features || '[]') : [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-1 space-y-6">

            <Card className="p-6 border rounded-xl relative">
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(vehicle.status)}`}>
                {vehicle.status}
              </div>

              <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center mt-8 overflow-hidden">
                {vehicle.primary_image_url ? (
                  <img 
                    src={vehicle.primary_image_url} 
                    alt={`${vehicle.make} ${vehicle.model}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CarIcon className="w-32 h-32 text-muted-foreground" />
                )}
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-2xl">{vehicle.make} {vehicle.model}</h3>
                  <p className="text-muted-foreground">{vehicle.category} • {vehicle.year}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#DC2626] font-bold text-2xl">{formatCurrency(vehicle.price_per_day)}</p>
                  <p className="text-muted-foreground text-sm">/ day</p>
                </div>
              </div>


              {vehicle.gallery_urls && Array.isArray(vehicle.gallery_urls) && vehicle.gallery_urls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {vehicle.gallery_urls.slice(0, 4).map((url, index) => (
                    <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}


              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Availability</h4>
                </div>
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border w-full" />
              </div>


              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Total Rentals</p>
                <p className="text-2xl font-bold">{vehicle.rental_count || 0} times</p>
              </div>
            </Card>
          </div>


          <div className="lg:col-span-2 space-y-6">

            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-6">Technical Specification</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Settings className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">Transmission</p>
                  <p className="text-muted-foreground">{vehicle.transmission || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Fuel className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">Fuel Type</p>
                  <p className="text-muted-foreground">{vehicle.fuel_type || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">Seats</p>
                  <p className="text-muted-foreground">{vehicle.seats || 'N/A'}</p>
                </div>
              </div>
            </Card>


            {features.length > 0 && (
              <Card className="p-6 border rounded-xl">
                <h3 className="font-bold text-xl mb-4">Car Features</h3>
                <div className="grid grid-cols-2 gap-4">
                  {features.map((item: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#DC2626] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}


            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-4">Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-medium">{vehicle.color || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="font-medium">{vehicle.license_plate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deposit Amount</p>
                  <p className="font-medium">{formatCurrency(vehicle.deposit_amount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Added On</p>
                  <p className="font-medium">{formatDate(vehicle.created_at)}</p>
                </div>
              </div>
            </Card>


            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-4">Recent Reservations ({reservations.length})</h3>
              {reservations.length > 0 ? (
                <div className="space-y-3">
                  {reservations.slice(0, 5).map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <p className="font-bold">
                          {reservation.customer?.full_name || `Customer #${reservation.customer_id.slice(0, 8)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(reservation.start_date)} - {formatDate(reservation.end_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{formatCurrency(reservation.total_price)}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          reservation.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {reservation.status}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/client/reservations/${reservation.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No reservations for this vehicle yet.</p>
              )}
            </Card>


            <div className="flex gap-4">
              <Button
                onClick={() => navigate(`/client/vehicles/${id}/edit`)}
                className="flex-1 bg-[#DC2626] hover:bg-[#B71C1C] text-white h-12 text-lg"
              >
                Edit Vehicle
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="h-12 px-6 text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </main>

      <ClientFooter />
    </div>
  )
}
