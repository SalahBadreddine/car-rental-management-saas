"use client"

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { logout, getAccessToken } from '@/lib/auth'
import { 
  Building2, 
  Users, 
  Car, 
  Calendar, 
  TrendingUp, 
  Plus,
  LogOut,
  Settings,
  Loader2
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface DashboardStats {
  totalTenants: number
  totalCars: number
  totalReservations: number
  totalUsers: number
  monthlyRevenue?: { name: string; total: number }[]
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const { user, clearAuth, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalTenants: 0,
    totalCars: 0,
    totalReservations: 0,
    totalUsers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    // Check if user is super_admin
    console.log('SuperAdminDashboard Check:', { 
      authLoading, 
      user, 
      role: user?.role,
      userRoleFromContext: user?.role // checking if there is a mismatch
    })
    
    if (!user || user.role !== 'super_admin') {
      console.log('Redirecting to browse. User:', user)
      navigate('/browse', { replace: true })
      return
    }

    const fetchStats = async () => {
      try {
        const token = getAccessToken()
        const response = await fetch(`${API_BASE_URL}/tenants/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'super_admin') {
      fetchStats()
    }
  }, [user, navigate, authLoading])

  const handleLogout = () => {
    logout()
    clearAuth()
    navigate('/browse', { replace: true })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#DC2626]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#DC2626] rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl">Super Admin</h1>
                <p className="text-sm text-muted-foreground">Platform Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/browse">
                <Button variant="outline" size="sm">
                  View Platform
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>


      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.full_name || 'Super Admin'}
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tenants</p>
                <p className="text-3xl font-bold">{stats.totalTenants}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cars</p>
                <p className="text-3xl font-bold">{stats.totalCars}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reservations</p>
                <p className="text-3xl font-bold">{stats.totalReservations}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Tenant Management
            </h3>
            <p className="text-muted-foreground mb-6">
              Create, edit, and manage rental companies on the platform.
            </p>
            <div className="flex gap-3">
              <Link to="/admin/tenants">
                <Button variant="outline">View All Tenants</Button>
              </Link>
              <Link to="/admin/tenants/new">
                <Button className="bg-[#DC2626] hover:bg-[#B71C1C]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tenant
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Monthly Revenue
            </h3>
            
            <div className="h-[300px] w-full">
              {/* @ts-ignore - Recharts types can be finicky in some setups */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyRevenue}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value} DZD`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#DC2626" 
                    radius={[4, 4, 0, 0]} 
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
               <p>Revenue trend for the last 6 months across all tenants.</p>
               <Button variant="outline" size="sm">Export Report</Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
