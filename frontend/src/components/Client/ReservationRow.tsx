"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

interface ReservationRowProps {
  carName: string
  customerName: string
  days: string
  status: "ongoing" | "confirmed" | "pending"
  showConfirmButton?: boolean
  showDeleteButton?: boolean
  reservationId?: string
}

export function ReservationRow({
  carName,
  customerName,
  days,
  status,
  showConfirmButton = false,
  showDeleteButton = false,
  reservationId = "#RES-12345",
}: ReservationRowProps) {
  const navigate = useNavigate()

  const statusStyles = {
    ongoing: "bg-primary text-primary-foreground",
    confirmed: "bg-secondary text-secondary-foreground",
    pending: "bg-status-pending text-primary-foreground",
  }

  const handleClick = () => {
    navigate(`/client/reservations/${reservationId.replace("#", "")}`)
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center justify-between py-3 border-b border-border last:border-0 px-5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
      style={{ backgroundColor: "#eeeeee" }}
    >
      <div className="flex-1">
        <p className="font-medium text-lg text-foreground">{carName}</p>
        <p className="text-s text-muted-foreground">{customerName}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{days}</span>
        <span className={cn("px-3 py-1 rounded-full text-xs font-medium", statusStyles[status])}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        {showConfirmButton && (
          <Button
            variant="default"
            size="sm"
            className="rounded-full text-xs px-4"
            onClick={(e) => {
              e.stopPropagation()
              // Handle confirm action
            }}
          >
            Confirm
          </Button>
        )}
        {showDeleteButton && (
          <Button
            variant="destructive"
            size="sm"
            className="rounded-full text-xs px-4"
            onClick={(e) => {
              e.stopPropagation()
              // Handle delete action
            }}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
