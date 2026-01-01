"use client"

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { getAccessToken } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import { 
  Building2, 
  Plus,
  Search,
  ArrowLeft,
  ExternalLink,
  Edit,
  Trash2,
  Loader2,
  MoreVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface Tenant {
  id: string
  name: string
  slug: string
  logo_url?: string
  contact_email?: string
  phone_number?: string
  subscription_status?: string
  created_at?: string
}

export default function TenantsList() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user || user.role !== 'super_admin') {
      navigate('/browse', { replace: true })
      return
    }

    fetchTenants()
  }, [user, navigate, authLoading])

  const fetchTenants = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tenants/public`)
      if (response.ok) {
        const data = await response.json()
        setTenants(data || [])
        setFilteredTenants(data || [])
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
      toast({
        title: "Error",
        description: "Failed to load tenants",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTenants(tenants)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = tenants.filter(
      tenant =>
        tenant.name.toLowerCase().includes(query) ||
        tenant.slug.toLowerCase().includes(query) ||
        tenant.contact_email?.toLowerCase().includes(query)
    )
    setFilteredTenants(filtered)
  }, [searchQuery, tenants])

  const handleDelete = async (tenantId: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return
    }

    setDeletingId(tenantId)
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Tenant deleted successfully",
        })
        fetchTenants()
      } else {
        throw new Error('Failed to delete tenant')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tenant",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
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
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-bold text-xl">All Tenants</h1>
                <p className="text-sm text-muted-foreground">{tenants.length} rental companies</p>
              </div>
            </div>

            <Link to="/admin/tenants/new">
              <Button className="bg-[#DC2626] hover:bg-[#B71C1C]">
                <Plus className="w-4 h-4 mr-2" />
                Add Tenant
              </Button>
            </Link>
          </div>
        </div>
      </header>


      <main className="container mx-auto px-4 py-8">

        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>


        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-sm">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Slug</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        {searchQuery ? 'No tenants match your search' : 'No tenants yet'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {tenant.logo_url ? (
                            <img
                              src={tenant.logo_url}
                              alt={tenant.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-[#DC2626] rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold">
                                {tenant.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="font-medium">{tenant.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          /{tenant.slug}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p>{tenant.contact_email || '—'}</p>
                          <p className="text-muted-foreground">{tenant.phone_number || '—'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/${tenant.slug}`} className="flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                View Site
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/tenants/${tenant.id}/edit`} className="flex items-center gap-2">
                                <Edit className="w-4 h-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(tenant.id)}
                              className="text-red-600 flex items-center gap-2"
                              disabled={deletingId === tenant.id}
                            >
                              {deletingId === tenant.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}
