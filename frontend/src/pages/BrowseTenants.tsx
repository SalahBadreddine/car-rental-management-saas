"use client"

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search, MapPin, Car, Loader2, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { logout as authLogout } from '@/lib/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

interface Tenant {
  id: string
  name: string
  slug: string
  logo_url?: string
  contact_email?: string
  phone_number?: string
}

export default function BrowseTenants() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = () => {
    authLogout()
    clearAuth()
  }

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tenants/public`)
        if (!response.ok) {
          throw new Error('Failed to fetch rental companies')
        }
        const data = await response.json()
        setTenants(data || [])
        setFilteredTenants(data || [])
      } catch (err) {
        console.error('Error fetching tenants:', err)
        setError('Failed to load rental companies')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTenants()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTenants(tenants)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = tenants.filter(
      tenant =>
        tenant.name.toLowerCase().includes(query) ||
        tenant.slug.toLowerCase().includes(query)
    )
    setFilteredTenants(filtered)
  }, [searchQuery, tenants])

  return (
    <div className="min-h-screen bg-background">

      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">

        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <span className="font-heading font-bold text-xl">RentoGo</span>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-white/70">
                  Welcome, {user.full_name || user.email}
                </span>
                {user.role === 'super_admin' && (
                  <Link to="/admin/dashboard">
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      Admin
                    </Button>
                  </Link>
                )}
                {user.role === 'client_admin' && (
                  <Link to="/client/dashboard">
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-1">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-[#DC2626] hover:bg-[#B71C1C]">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        

        <div className="container mx-auto px-4 pb-20 pt-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Find Your Perfect <span className="text-[#DC2626]">Rental</span>
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Browse trusted car rental companies and discover the best deals for your next adventure.
          </p>


          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search rental companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
            />
          </div>
        </div>
      </div>


      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#DC2626]" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center py-20">
            <Car className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No rental companies found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'No rental companies are available yet'}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-8">
              {searchQuery ? `Results for "${searchQuery}"` : 'All Rental Companies'}
              <span className="text-muted-foreground text-lg font-normal ml-2">
                ({filteredTenants.length})
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTenants.map((tenant) => (
                <Link key={tenant.id} to={`/${tenant.slug}`}>
                  <Card className="group overflow-hidden border rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

                    <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
                      {tenant.logo_url ? (
                        <img
                          src={tenant.logo_url}
                          alt={tenant.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[#DC2626] flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">
                            {tenant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>


                    <div className="p-5">
                      <h3 className="font-bold text-xl mb-2 group-hover:text-[#DC2626] transition-colors">
                        {tenant.name}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                        <MapPin className="w-4 h-4" />
                        /{tenant.slug}
                      </p>

                      <Button
                        className="w-full bg-[#DC2626] hover:bg-[#B71C1C] text-white"
                      >
                        View Cars
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>


      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/50">
            © {new Date().getFullYear()} Car Rental Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
