"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import Header from "@/components/Client/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Calendar, Car, User, DollarSign } from "lucide-react"
import ClientFooter from "@/components/Client/Footer"
import { reservationsApi, type Reservation } from "@/services/reservationsApi"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

type ReservationStatus = "all" | "pending" | "confirmed" | "completed" | "cancelled"

// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Calculate days between dates
const calculateDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Get status badge color
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

export default function ClientReservations() {
  const [filter, setFilter] = useState<ReservationStatus>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const navigate = useNavigate()
  const { toast } = useToast()
  const { selectedLocation } = useAuth()

  // Fetch reservations when location changes
  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true)
      try {
        const data = await reservationsApi.getAll({ locationId: selectedLocation || undefined })
        setReservations(data)
      } catch (error) {
        console.error('Error fetching reservations:', error)
        toast({
          title: "Error",
          description: "Failed to load reservations. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [selectedLocation])

  // Filter reservations by status and search
  const filteredReservations = useMemo(() => {
    const filtered = reservations.filter((reservation) => {
      // Status filter
      if (filter !== "all" && reservation.status !== filter) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const carName = reservation.car 
          ? `${reservation.car.make} ${reservation.car.model}`.toLowerCase()
          : reservation.car_id.toLowerCase()
        const customerName = reservation.customer?.full_name?.toLowerCase() || reservation.customer_id.toLowerCase()
        
        return (
          reservation.id.toLowerCase().includes(query) ||
          carName.includes(query) ||
          customerName.includes(query)
        )
      }

      return true
    })
    return filtered
  }, [reservations, filter, searchQuery])

  // Paginate filtered reservations
  const paginatedReservations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredReservations.slice(startIndex, endIndex)
  }, [filteredReservations, currentPage])

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchQuery, selectedLocation])

  // Group by status from paginated results
  const pendingReservations = paginatedReservations.filter(r => r.status === 'pending')
  const confirmedReservations = paginatedReservations.filter(r => r.status === 'confirmed')
  const completedReservations = paginatedReservations.filter(r => r.status === 'completed')
  const cancelledReservations = paginatedReservations.filter(r => r.status === 'cancelled')

  const handleViewDetails = (reservationId: string) => {
    navigate(`/client/reservations/${reservationId}`)
  }

  const handleUpdateStatus = async (reservationId: string, newStatus: string) => {
    try {
      const updated = await reservationsApi.updateStatus(reservationId, newStatus)
      if (updated) {
        setReservations(prev => 
          prev.map(r => r.id === reservationId ? { ...r, status: newStatus as any } : r)
        )
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
    }
  }

  // Render reservation card
  const renderReservationCard = (reservation: Reservation) => (
    <div 
      key={reservation.id} 
      className="flex items-center justify-between p-4 bg-card border rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="flex-1">
        <p className="font-bold">
          {reservation.car 
            ? `${reservation.car.make} ${reservation.car.model}` 
            : `Car #${reservation.car_id.slice(0, 8)}`}
        </p>
        <p className="text-sm text-muted-foreground">
          {reservation.customer?.full_name || `Customer #${reservation.customer_id.slice(0, 8)}`}
        </p>
      </div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium">Pick-Up: </span>
          {formatDate(reservation.start_date)}
        </p>
        <p className="text-sm">
          <span className="font-medium">Return: </span>
          {formatDate(reservation.end_date)}
        </p>
      </div>
      <div className="flex items-center gap-6">
        <div>
          <p className="font-bold">{formatCurrency(reservation.total_price)}</p>
          <p className="text-sm text-muted-foreground">
            {calculateDays(reservation.start_date, reservation.end_date)} Days
          </p>
        </div>
        <span className={`px-4 py-1 rounded-full text-sm font-medium min-w-[100px] text-center ${getStatusBadge(reservation.status)}`}>
          {reservation.status}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="min-w-[80px]"
          onClick={() => handleViewDetails(reservation.id)}
        >
          Details
        </Button>
      </div>
    </div>
  )

  // Render section
  const renderSection = (title: string, items: Reservation[], statusFilter: ReservationStatus) => {
    if ((filter !== "all" && filter !== statusFilter) || items.length === 0) {
      return null
    }

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <span className="text-muted-foreground">{items.length} reservation{items.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="space-y-3">
          {items.map(renderReservationCard)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-4">Reservations</h1>
        <p className="text-center text-lg text-muted-foreground mb-8">
          Manage all your rental reservations
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by ID, car, or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-6 text-lg rounded-lg border-2"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as ReservationStatus[]).map((status) => (
            <Button
              key={status}
              onClick={() => setFilter(status)}
              className={
                filter === status 
                  ? "bg-[#DC2626] hover:bg-[#B71C1C]" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }
            >
              {status === 'all' ? 'ALL' : status}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[#DC2626]" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredReservations.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No reservations found</h3>
            <p className="text-muted-foreground">
              {reservations.length === 0 
                ? "You don't have any reservations yet. Customers can book vehicles through the public portal."
                : "Try adjusting your filters or search query."}
            </p>
          </div>
        )}

        {/* Reservations by Status */}
        {!isLoading && filteredReservations.length > 0 && (
          <>
            {renderSection("Pending", pendingReservations, "pending")}
            {renderSection("Confirmed", confirmedReservations, "confirmed")}
            {renderSection("Completed", completedReservations, "completed")}
            {renderSection("Cancelled", cancelledReservations, "cancelled")}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-[#DC2626] hover:bg-[#B71C1C]" : ""}
                      variant={currentPage === page ? "default" : "outline"}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Summary Stats */}
        {!isLoading && reservations.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{reservations.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-800">{pendingReservations.length}</p>
              <p className="text-sm text-yellow-600">Pending</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-800">{confirmedReservations.length}</p>
              <p className="text-sm text-blue-600">Confirmed</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-800">{completedReservations.length}</p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
          </div>
        )}
      </main>

      <ClientFooter />
    </div>
  )
}
