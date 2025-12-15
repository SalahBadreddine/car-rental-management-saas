"use client"

import { useState } from "react"
import Header from "@/components/Client/Header"
import Footer from "@/components/Footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search } from "lucide-react"

type NotificationType = "info" | "warning" | "error" | "success"
type NotificationFilter = "ALL" | "unread" | "read"

interface Notification {
  id: string
  message: string
  vehicle: string
  customer: string
  reservationId: string
  timestamp: string
  type: NotificationType
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    message: "A new reservation has been created. Please review and confirm reservation.",
    vehicle: "Toyota Camry 2024",
    customer: "Emily Rodriguez",
    reservationId: "#RES-2024-1156",
    timestamp: "Just now",
    type: "info",
    read: false,
  },
  {
    id: "2",
    message: "Vehicle is scheduled for return today. Prepare for inspection and ensure proper documentation is ready.",
    vehicle: "Toyota Camry 2024",
    customer: "Emily Rodriguez",
    reservationId: "#RES-2024-1156",
    timestamp: "Just now",
    type: "warning",
    read: false,
  },
  {
    id: "3",
    message:
      "Vehicle has not been returned after the scheduled return date. Late fees are now being applied. Please contact the customer immediately.",
    vehicle: "Toyota Camry 2024",
    customer: "Emily Rodriguez",
    reservationId: "#RES-2024-1156",
    timestamp: "2 hours ago",
    type: "error",
    read: false,
  },
  {
    id: "4",
    message: "Payment of $450.00 has been successfully processed for the completed rental.",
    vehicle: "Toyota Camry 2024",
    customer: "Emily Rodriguez",
    reservationId: "#RES-2024-1156",
    timestamp: "2 hours ago",
    type: "success",
    read: false,
  },
  {
    id: "5",
    message:
      "Regular maintenance is due for this vehicle. Schedule service appointment to ensure vehicle safety and compliance.",
    vehicle: "Toyota Camry 2024",
    timestamp: "2 hours ago",
    customer: "Emily Rodriguez",
    reservationId: "#RES-2024-1156",
    type: "warning",
    read: false,
  },
  {
    id: "6",
    message:
      "Regular maintenance is due for this vehicle. Schedule service appointment to ensure vehicle safety and compliance.",
    vehicle: "Toyota Camry 2024",
    timestamp: "2 hours ago",
    customer: "Emily Rodriguez",
    reservationId: "#RES-2024-1156",
    type: "warning",
    read: false,
  },
  {
    id: "7",
    message:
      "Vehicle has not been returned after the scheduled return date. Late fees are now being applied. Please contact the customer immediately.",
    vehicle: "Toyota Camry 2024",
    customer: "Emily Rodriguez",
    reservationId: "#RES-2024-1156",
    timestamp: "2 hours ago",
    type: "error",
    read: false,
  },
]

export default function ClientNotifications() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<NotificationFilter>("ALL")
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const filteredNotifications = notifications.filter((notif) => {
    // Search filter
    if (searchQuery && !notif.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Read/unread filter
    if (filter === "unread" && notif.read) return false
    if (filter === "read" && !notif.read) return false

    return true
  })

  const getTypeBadge = (type: NotificationType) => {
    const styles = {
      info: "bg-blue-100 text-blue-700 border-blue-200",
      warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
      error: "bg-red-100 text-red-700 border-red-200",
      success: "bg-green-100 text-green-700 border-green-200",
    }
    return styles[type]
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">Notifications</h1>
          <p className="text-gray-600 text-lg">Search for a notification</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-6 text-lg rounded-xl border-2"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <Button
            onClick={() => setFilter("ALL")}
            variant={filter === "ALL" ? "default" : "outline"}
            className={`px-8 py-2 rounded-full ${filter === "ALL" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
          >
            ALL
          </Button>
          <Button
            onClick={() => setFilter("unread")}
            variant={filter === "unread" ? "default" : "outline"}
            className={`px-8 py-2 rounded-full ${filter === "unread" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
          >
            unread
          </Button>
          <Button
            onClick={() => setFilter("read")}
            variant={filter === "read" ? "default" : "outline"}
            className={`px-8 py-2 rounded-full ${filter === "read" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
          >
            read
          </Button>
        </div>

        {/* Notifications List */}
        <div className="max-w-5xl mx-auto space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-6 rounded-xl bg-white hover:shadow-lg transition-shadow relative ${
                !notification.read ? "border-l-4 border-l-red-600" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <p className="text-gray-700 mb-3">{notification.message}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="font-medium">{notification.vehicle}</span>
                    <span>Customer: {notification.customer}</span>
                    <span>ID: {notification.reservationId}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-semibold uppercase border ${getTypeBadge(
                      notification.type,
                    )}`}
                  >
                    {notification.type}
                  </span>
                  <span className="text-sm text-gray-500 whitespace-nowrap">{notification.timestamp}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No notifications found</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
