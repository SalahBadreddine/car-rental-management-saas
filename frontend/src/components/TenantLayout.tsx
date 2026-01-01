"use client"

import { Outlet } from 'react-router-dom'
import { TenantProvider, useTenant } from '@/contexts/TenantContext'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

function TenantLayoutContent() {
  const { isLoading, error, tenant } = useTenant()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#DC2626] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading rental company...</p>
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚗</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Company Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "The rental company you're looking for doesn't exist or has been removed."}
          </p>
          <Link to="/browse">
            <Button className="bg-[#DC2626] hover:bg-[#B71C1C] text-white">
              Browse All Rental Companies
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default function TenantLayout() {
  return (
    <TenantProvider>
      <TenantLayoutContent />
    </TenantProvider>
  )
}
