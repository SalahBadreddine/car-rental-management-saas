"use client"

import { useState, useEffect, useMemo } from "react"
import Header from "@/components/Client/Header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Loader2, Bell, CheckCheck } from "lucide-react"
import ClientFooter from "@/components/Client/Footer"
import { notificationsApi, type Notification } from "@/services/notificationsApi"
import { useToast } from "@/hooks/use-toast"

type NotificationFilter = "ALL" | "unread" | "read"

// Format time ago helper
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

export default function ClientNotifications() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<NotificationFilter>("ALL")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const response = await notificationsApi.getAll()
        setNotifications(response.data)
        setUnreadCount(response.unread_count)
      } catch (error) {
        console.error('Error fetching notifications:', error)
        toast({
          title: "Error",
          description: "Failed to load notifications.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesMessage = notif.message?.toLowerCase().includes(query)
        const matchesTitle = notif.title?.toLowerCase().includes(query)
        
        if (!matchesMessage && !matchesTitle) {
          return false
        }
      }

      // Read/unread filter
      if (filter === "unread" && notif.is_read) return false
      if (filter === "read" && !notif.is_read) return false

      return true
    })
  }, [notifications, searchQuery, filter])

  // Paginate filtered notifications
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredNotifications.slice(startIndex, endIndex)
  }, [filteredNotifications, currentPage])

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchQuery])

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const success = await notificationsApi.markAsRead(notificationId)
      if (success) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      })
    }
  }

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const success = await notificationsApi.markAllAsRead()
      if (success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
        toast({
          title: "Success",
          description: "All notifications marked as read.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      })
    }
  }

  // Get type badge styling
  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      info: "bg-blue-100 text-blue-700 border-blue-200",
      warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
      error: "bg-red-100 text-red-700 border-red-200",
      success: "bg-green-100 text-green-700 border-green-200",
    }
    return styles[type] || styles.info
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">Notifications</h1>
          <p className="text-gray-600 text-lg">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
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

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {(["ALL", "unread", "read"] as NotificationFilter[]).map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? "bg-[#DC2626] hover:bg-[#B71C1C]"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }
            >
              {f === "ALL" ? "ALL" : f}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-2 bg-white text-[#DC2626] rounded-full px-2 py-0.5 text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </Button>
          ))}
          
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="ml-4"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[#DC2626]" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredNotifications.length === 0 && (
          <div className="text-center py-20">
            <Bell className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              {notifications.length === 0 
                ? "You don't have any notifications yet."
                : "No notifications match your search or filter."}
            </p>
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && filteredNotifications.length > 0 && (
          <>
            <div className="space-y-4 max-w-4xl mx-auto">
              {paginatedNotifications.map((notif) => (
              <Card
                key={notif.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                  !notif.is_read ? 'border-l-4 border-l-[#DC2626] bg-white' : 'bg-gray-50'
                }`}
                onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Status Indicator */}
                  <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                    !notif.is_read ? 'bg-[#DC2626]' : 'bg-gray-300'
                  }`} />
                  
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${!notif.is_read ? 'text-black' : 'text-gray-600'}`}>
                          {notif.title || 'Notification'}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getTypeBadge(notif.type)}`}>
                          {notif.type}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{formatTimeAgo(notif.created_at)}</span>
                    </div>
                    
                    {/* Message */}
                    <p className={`mb-3 ${!notif.is_read ? 'text-gray-800' : 'text-gray-500'}`}>
                      {notif.message}
                    </p>
                    
                    {/* Notification Type Badge Already Shown Above */}
                  </div>
                </div>
              </Card>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 max-w-4xl mx-auto">
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
      </main>

      <ClientFooter />
    </div>
  )
}
