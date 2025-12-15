"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "@/components/Client/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type ReservationStatus = "all" | "pending" | "ongoing" | "confirmed" | "old"

interface Reservation {
  id: string
  car: string
  customer: string
  pickupDate: string
  returnDate: string
  price: string
  days: string
  status: "pending" | "ongoing" | "confirmed" | "returned"
}

const mockReservations: Reservation[] = [
  // Pending
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "pending",
  },
  {
    id: "#RES-12346",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "pending",
  },

  // Ongoing
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "ongoing",
  },
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "ongoing",
  },
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "ongoing",
  },
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "ongoing",
  },

  // Confirmed
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "confirmed",
  },
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "confirmed",
  },
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "confirmed",
  },
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "confirmed",
  },

  // Previous
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "returned",
  },
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "returned",
  },
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "returned",
  },
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "returned",
  },
  {
    id: "#RES-12345",
    car: "BMW 5 Series",
    customer: "John Smith",
    pickupDate: "3/12/2025",
    returnDate: "4/12/2025",
    price: "$720",
    days: "4 Days",
    status: "returned",
  },
]

export default function ClientReservations() {
  const [filter, setFilter] = useState<ReservationStatus>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  const filteredReservations = mockReservations.filter((reservation) => {
    if (filter !== "all") {
      if (filter === "old" && reservation.status !== "returned") return false
      if (filter !== "old" && reservation.status !== filter) return false
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        reservation.id.toLowerCase().includes(query) ||
        reservation.car.toLowerCase().includes(query) ||
        reservation.customer.toLowerCase().includes(query)
      )
    }

    return true
  })

  const pendingReservations = filteredReservations.filter((r) => r.status === "pending")
  const ongoingReservations = filteredReservations.filter((r) => r.status === "ongoing")
  const confirmedReservations = filteredReservations.filter((r) => r.status === "confirmed")
  const previousReservations = filteredReservations.filter((r) => r.status === "returned")

  const handleViewDetails = (reservationId: string) => {
    navigate(`/client/reservations/${reservationId.replace("#", "")}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-4">Reservations</h1>
        <p className="text-center text-lg text-muted-foreground mb-8">Search for a reservation</p>

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
        <div className="flex justify-center gap-3 mb-12">
          <Button
            onClick={() => setFilter("all")}
            className={
              filter === "all" ? "bg-[#DC2626] hover:bg-[#B71C1C]" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }
          >
            ALL
          </Button>
          <Button
            onClick={() => setFilter("pending")}
            className={
              filter === "pending"
                ? "bg-[#DC2626] hover:bg-[#B71C1C]"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }
          >
            pending
          </Button>
          <Button
            onClick={() => setFilter("ongoing")}
            className={
              filter === "ongoing"
                ? "bg-[#DC2626] hover:bg-[#B71C1C]"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }
          >
            ongoing
          </Button>
          <Button
            onClick={() => setFilter("confirmed")}
            className={
              filter === "confirmed"
                ? "bg-[#DC2626] hover:bg-[#B71C1C]"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }
          >
            confirmed
          </Button>
          <Button
            onClick={() => setFilter("old")}
            className={
              filter === "old" ? "bg-[#DC2626] hover:bg-[#B71C1C]" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }
          >
            old
          </Button>
        </div>

        {/* Pending Reservations */}
        {(filter === "all" || filter === "pending") && pendingReservations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Pending</h2>
            <div className="space-y-3">
              {pendingReservations.map((reservation, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-card border rounded-lg">
                  <div className="flex-1">
                    <p className="font-bold">{reservation.car}</p>
                    <p className="text-sm text-muted-foreground">{reservation.customer}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Pick-Up Date</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{reservation.pickupDate}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Return Date</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{reservation.returnDate}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{reservation.price}</p>
                    <p className="text-sm text-muted-foreground">{reservation.days}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium">{reservation.id}</p>
                    <Button className="bg-[#DC2626] hover:bg-[#B71C1C]">Confirm</Button>
                    <Button variant="outline" onClick={() => handleViewDetails(reservation.id)}>
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ongoing Reservations */}
        {(filter === "all" || filter === "ongoing") && ongoingReservations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ongoing</h2>
            <div className="space-y-3">
              {ongoingReservations.map((reservation, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-card border rounded-lg">
                  <div className="flex-1">
                    <p className="font-bold">{reservation.car}</p>
                    <p className="text-sm text-muted-foreground">{reservation.customer}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Return Date</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{reservation.returnDate}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{reservation.price}</p>
                    <p className="text-sm text-muted-foreground">{reservation.days}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium">{reservation.id}</p>
                    <Button className="bg-[#DC2626] hover:bg-[#B71C1C]">Ongoing</Button>
                    <Button variant="outline" onClick={() => handleViewDetails(reservation.id)}>
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed Reservations */}
        {(filter === "all" || filter === "confirmed") && confirmedReservations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Confirmed</h2>
            <div className="space-y-3">
              {confirmedReservations.map((reservation, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-card border rounded-lg">
                  <div className="flex-1">
                    <p className="font-bold">{reservation.car}</p>
                    <p className="text-sm text-muted-foreground">{reservation.customer}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Pick-Up Date</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{reservation.pickupDate}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{reservation.price}</p>
                    <p className="text-sm text-muted-foreground">{reservation.days}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium">{reservation.id}</p>
                    <Button className="bg-[#DC2626] hover:bg-[#B71C1C]">Confirmed</Button>
                    <Button variant="outline" onClick={() => handleViewDetails(reservation.id)}>
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous Reservations */}
        {(filter === "all" || filter === "old") && previousReservations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Previous Reservations</h2>
            <div className="space-y-3">
              {previousReservations.slice(0, 5).map((reservation, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-card border rounded-lg">
                  <div className="flex-1">
                    <p className="font-bold">{reservation.car}</p>
                    <p className="text-sm text-muted-foreground">{reservation.customer}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Pick-Up Date</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{reservation.pickupDate}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Return Date</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{reservation.returnDate}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{reservation.price}</p>
                    <p className="text-sm text-muted-foreground">{reservation.days}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium">{reservation.id}</p>
                    <Button variant="outline" onClick={() => handleViewDetails(reservation.id)}>
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {previousReservations.length > 5 && (
              <div className="text-center mt-6">
                <Button variant="link" className="text-muted-foreground">
                  See more
                </Button>
              </div>
            )}
          </div>
        )}

        {filteredReservations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No reservations found.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
