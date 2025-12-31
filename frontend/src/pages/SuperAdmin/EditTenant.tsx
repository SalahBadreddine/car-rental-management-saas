"use client"

import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { getAccessToken } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft,
  Loader2,
  Upload,
  Building2,
  Trash2
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function EditTenant() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    contactEmail: '',
    phoneNumber: '',
  })
  
  // Auth check
  useEffect(() => {
    if (authLoading) return

    if (!user || user.role !== 'super_admin') {
      navigate('/browse', { replace: true })
    }
  }, [user, navigate, authLoading])

  // Fetch tenant data
  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const token = getAccessToken()
        const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch tenant')
        }

        const data = await response.json()
        setFormData({
          name: data.name,
          slug: data.slug,
          contactEmail: data.contact_email || '',
          phoneNumber: data.phone_number || '',
        })
        if (data.logo_url) {
          setLogoPreview(data.logo_url)
        }
      } catch (error) {
        console.error('Error fetching tenant:', error)
        toast({
          title: "Error",
          description: "Failed to load tenant details",
          variant: "destructive",
        })
        navigate('/admin/tenants')
      } finally {
        setIsLoading(false)
      }
    }

    if (id && user?.role === 'super_admin') {
      fetchTenant()
    }
  }, [id, user, navigate, toast])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.slug) {
      toast({
        title: "Error",
        description: "Name and slug are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const token = getAccessToken()
      
      const form = new FormData()
      form.append('name', formData.name)
      form.append('slug', formData.slug)
      if (formData.contactEmail) form.append('contactEmail', formData.contactEmail)
      if (formData.phoneNumber) form.append('phoneNumber', formData.phoneNumber)
      if (logoFile) form.append('file', logoFile)

      const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update tenant')
      }

      toast({
        title: "Success",
        description: "Tenant updated successfully",
      })
      
      navigate('/admin/tenants')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update tenant",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return
    }

    try {
      const token = getAccessToken()
      const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
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
        navigate('/admin/tenants')
      } else {
        throw new Error('Failed to delete tenant')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tenant",
        variant: "destructive",
      })
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#DC2626]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/tenants">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-bold text-xl">Edit Tenant</h1>
                <p className="text-sm text-muted-foreground">Manage rental company details</p>
              </div>
            </div>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
              type="button"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Tenant
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <label htmlFor="logo">
                    <Button type="button" variant="outline" asChild>
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Change Logo
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., RentoGo Cars"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <div className="flex items-center">
                <span className="bg-gray-100 border border-r-0 rounded-l-md px-3 py-2 text-sm text-muted-foreground">
                  yoursite.com/
                </span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="rentogo"
                  className="rounded-l-none"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will be the URL for the company's public page
              </p>
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="contact@company.com"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/tenants')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#DC2626] hover:bg-[#B71C1C]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
