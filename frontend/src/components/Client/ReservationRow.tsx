import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ReservationRowProps {
  carName: string;
  customerName: string;
  days: string;
  status: "ongoing" | "confirmed" | "pending";
  showConfirmButton?: boolean;
  showDeleteButton?: boolean;
}

export function ReservationRow({
  carName,
  customerName,
  days,
  status,
  showConfirmButton = false,
  showDeleteButton = false,
}: ReservationRowProps) {
  const statusStyles = {
    ongoing: "bg-primary text-primary-foreground",
    confirmed: "bg-secondary text-secondary-foreground",
    pending: "bg-status-pending text-primary-foreground",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0 px-5 rounded-lg" style={{ backgroundColor: "#eeeeee" }}>
      <div className="flex-1">
        <p className="font-medium text-lg text-foreground">{carName}</p>
        <p className="text-s text-muted-foreground">{customerName}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{days}</span>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            statusStyles[status]
          )}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        {showConfirmButton && (
          <Button variant="default" size="sm" className="rounded-full text-xs px-4">
            Confirm
          </Button>
        )}
        {showDeleteButton && (
          <Button variant="destructive" size="sm" className="rounded-full text-xs px-4">
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
