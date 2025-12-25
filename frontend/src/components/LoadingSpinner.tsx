"use client"

import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  message?: string
  fullScreen?: boolean
}

export const LoadingSpinner = ({ message = "Loading...", fullScreen = false }: LoadingSpinnerProps) => {
  const containerClass = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center py-12"

  return (
    <div className={containerClass}>
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
