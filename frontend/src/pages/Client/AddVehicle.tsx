"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from "@/components/Client/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Settings, Fuel, Wind, Users, CarIcon, Check, Upload, Loader2, X, MapPin, AlertCircle } from "lucide-react"
import ClientFooter from "@/components/Client/Footer"
import { carsApi, type CreateCarDto } from "@/services/carsApi"
import { locationsApi, type Location } from "@/services/locationsApi"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

const categories = [
  { value: "Sedan", label: "Sedan" },
  { value: "SUV", label: "SUV" },
  { value: "Sport", label: "Sport" },
  { value: "Van", label: "Van" },
  { value: "Pickup", label: "Pickup" },
  { value: "Luxury", label: "Luxury" },
]

const transmissions = [
  { value: "Automatic", label: "Automatic" },
  { value: "Manual", label: "Manual" },
]

const fuelTypes = [
  { value: "Petrol", label: "Petrol" },
  { value: "Diesel", label: "Diesel" },
  { value: "Electric", label: "Electric" },
  { value: "Hybrid", label: "Hybrid" },
]

const colors = [
  { value: "Black", label: "Black" },
  { value: "White", label: "White" },
  { value: "Silver", label: "Silver" },
  { value: "Red", label: "Red" },
  { value: "Blue", label: "Blue" },
  { value: "Gray", label: "Gray" },
]

export default function AddVehicle() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { selectedLocation: contextLocation, setSelectedLocation, user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  
  // Location state
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string>(contextLocation || "")
  const [showLocationModal, setShowLocationModal] = useState(false)
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
    category: "",
    pricePerDay: 0,
    depositAmount: 0,
    transmission: "",
    fuelType: "",
    seats: 5,
    color: "",
  })
  
  // Image state
  const [primaryImage, setPrimaryImage] = useState<File | null>(null)
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  
  // Features state
  const [features, setFeatures] = useState({
    abs: false,
    airBags: false,
    cruiseControl: false,
    airConditioner: false,
    bluetooth: false,
    gps: false,
  })

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await locationsApi.getAll()
        setLocations(data)
        // If context has a specific location, use it
        if (contextLocation) {
          setSelectedLocationId(contextLocation)
        } else if (!contextLocation || contextLocation === "") {
          // If "All Locations" is selected or no location, force user to select
          setShowLocationModal(true)
        }
      } catch (error) {
        console.error('Error fetching locations:', error)
        toast({
          title: "Error",
          description: "Failed to load locations.",
          variant: "destructive",
        })
      }
    }
    fetchLocations()
  }, [contextLocation])

  // Handle input change
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle primary image
  const handlePrimaryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPrimaryImage(file)
      setPrimaryImagePreview(URL.createObjectURL(file))
    }
  }

  // Handle gallery images
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 10) // Max 10 images
    setGalleryImages(prev => [...prev, ...files].slice(0, 10))
    setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))].slice(0, 10))
  }

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Get selected features as array
  const getFeaturesList = (): string[] => {
    const featuresList: string[] = []
    if (features.abs) featuresList.push("ABS")
    if (features.airBags) featuresList.push("Air Bags")
    if (features.cruiseControl) featuresList.push("Cruise Control")
    if (features.airConditioner) featuresList.push("Air Conditioner")
    if (features.bluetooth) featuresList.push("Bluetooth")
    if (features.gps) featuresList.push("GPS Navigation")
    return featuresList
  }

  // Validate form
  const validateForm = (): boolean => {
    if (!selectedLocationId || selectedLocationId === "") {
      toast({ 
        title: "Error", 
        description: "Please select a specific location for this vehicle. You cannot add vehicles to 'All Locations'.", 
        variant: "destructive" 
      })
      return false
    }
    if (!formData.make.trim()) {
      toast({ title: "Error", description: "Please enter the car make/brand.", variant: "destructive" })
      return false
    }
    if (!formData.model.trim()) {
      toast({ title: "Error", description: "Please enter the car model.", variant: "destructive" })
      return false
    }
    if (!formData.category) {
      toast({ title: "Error", description: "Please select a category.", variant: "destructive" })
      return false
    }
    if (!formData.pricePerDay || formData.pricePerDay <= 0) {
      toast({ title: "Error", description: "Please enter a valid price per day.", variant: "destructive" })
      return false
    }
    if (!formData.licensePlate.trim()) {
      toast({ title: "Error", description: "Please enter the license plate.", variant: "destructive" })
      return false
    }
    return true
  }

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const carData: CreateCarDto = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        licensePlate: formData.licensePlate,
        category: formData.category,
        pricePerDay: formData.pricePerDay,
        depositAmount: formData.depositAmount || 0,
        transmission: formData.transmission || undefined,
        fuelType: formData.fuelType || undefined,
        seats: formData.seats || 5,
        color: formData.color || undefined,
        features: getFeaturesList(),
        locationId: selectedLocationId, // Use selected location from state
      }

      const result = await carsApi.createCar(
        carData,
        primaryImage || undefined,
        galleryImages.length > 0 ? galleryImages : undefined
      )

      if (result) {
        toast({
          title: "Success!",
          description: "Vehicle has been added successfully.",
        })
        navigate("/client/vehicles")
      } else {
        throw new Error("Failed to create car")
      }
    } catch (error) {
      console.error('Error creating car:', error)
      toast({
        title: "Error",
        description: "Failed to add vehicle. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Force Location Selection Modal */}
      <Dialog open={showLocationModal} onOpenChange={(open) => {
        // Prevent closing without selection
        if (!open && !selectedLocationId) {
          toast({
            title: "Location Required",
            description: "You must select a location to add a vehicle.",
            variant: "destructive",
          })
          return
        }
        setShowLocationModal(open)
      }}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => {
          // Prevent closing by clicking outside
          if (!selectedLocationId) {
            e.preventDefault()
          }
        }} onEscapeKeyDown={(e) => {
          // Prevent closing with Escape
          if (!selectedLocationId) {
            e.preventDefault()
          }
        }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#DC2626]" />
              Select a Location
            </DialogTitle>
            <DialogDescription>
              You have "All Locations" selected. To add a new vehicle, you must choose a specific location where this vehicle will be available.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Vehicles cannot be assigned to "All Locations". Each vehicle must belong to a specific location.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Choose Location *</label>
              <Select 
                value={selectedLocationId} 
                onValueChange={(value) => {
                  setSelectedLocationId(value)
                  // Update the global context as well so header updates
                  setSelectedLocation(value)
                  if (value) {
                    setShowLocationModal(false)
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name} - {loc.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => navigate("/client/vehicles")}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedLocationId) {
                    // Update global context before closing
                    setSelectedLocation(selectedLocationId)
                    setShowLocationModal(false)
                  } else {
                    toast({
                      title: "Error",
                      description: "Please select a location first.",
                      variant: "destructive",
                    })
                  }
                }}
                className="flex-1 bg-[#DC2626] hover:bg-[#B71C1C]"
                disabled={!selectedLocationId}
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8">Add New Vehicle</h1>

        {/* Show Selected Location */}
        {selectedLocationId && locations.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Creating vehicle for: <strong>{locations.find(l => l.id === selectedLocationId)?.name}</strong>
              </p>
              <p className="text-xs text-blue-700">
                {locations.find(l => l.id === selectedLocationId)?.city}
              </p>
            </div>
            {locations.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => setShowLocationModal(true)}
              >
                Change Location
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info & Images */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-lg mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Make/Brand *</label>
                  <Input 
                    placeholder="e.g., Toyota, BMW, Mercedes" 
                    value={formData.make}
                    onChange={(e) => handleChange("make", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Model *</label>
                  <Input 
                    placeholder="e.g., Camry, 3 Series, C-Class" 
                    value={formData.model}
                    onChange={(e) => handleChange("model", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Year</label>
                    <Input 
                      type="number" 
                      placeholder="2024" 
                      value={formData.year}
                      onChange={(e) => handleChange("year", parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">License Plate *</label>
                    <Input 
                      placeholder="ABC-123" 
                      value={formData.licensePlate}
                      onChange={(e) => handleChange("licensePlate", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category *</label>
                  <Select value={formData.category} onValueChange={(v) => handleChange("category", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price/Day ($) *</label>
                    <Input 
                      type="number" 
                      placeholder="50" 
                      value={formData.pricePerDay || ""}
                      onChange={(e) => handleChange("pricePerDay", parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Deposit ($)</label>
                    <Input 
                      type="number" 
                      placeholder="200" 
                      value={formData.depositAmount || ""}
                      onChange={(e) => handleChange("depositAmount", parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Car Images */}
            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-lg mb-4">Vehicle Images</h3>
              
              {/* Primary Image */}
              <div 
                className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {primaryImagePreview ? (
                  <img src={primaryImagePreview} alt="Primary" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload primary image</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePrimaryImageChange}
                className="hidden"
              />

              {/* Gallery Images */}
              <p className="text-sm font-medium mb-2">Gallery ({galleryImages.length}/10)</p>
              <div className="grid grid-cols-4 gap-2">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                    <button
                      onClick={() => removeGalleryImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {galleryImages.length < 10 && (
                  <div
                    className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground text-3xl cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    +
                  </div>
                )}
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                className="hidden"
              />
            </Card>
          </div>

          {/* Right Column - Specs & Features */}
          <div className="lg:col-span-2 space-y-6">
            {/* Technical Specification */}
            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-6">Technical Specification</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-center mb-2">
                    <Settings className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-2 text-center">Transmission</p>
                  <Select value={formData.transmission} onValueChange={(v) => handleChange("transmission", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {transmissions.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex justify-center mb-2">
                    <Fuel className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-2 text-center">Fuel Type</p>
                  <Select value={formData.fuelType} onValueChange={(v) => handleChange("fuelType", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex justify-center mb-2">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-2 text-center">Seats</p>
                  <Input 
                    type="number" 
                    placeholder="5" 
                    className="text-center"
                    value={formData.seats}
                    onChange={(e) => handleChange("seats", parseInt(e.target.value))}
                  />
                </div>
              </div>
            </Card>

            {/* Car Features */}
            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-4">Car Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(features).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${value ? "bg-[#DC2626]" : "bg-gray-300"}`}
                    >
                      {value && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setFeatures({ ...features, [key]: e.target.checked })}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>
            </Card>

            {/* Color */}
            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-xl mb-4">Color</h3>
              <Select value={formData.color} onValueChange={(v) => handleChange("color", v)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => navigate("/client/vehicles")}
                variant="outline"
                className="flex-1 h-12 text-lg"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-[#DC2626] hover:bg-[#B71C1C] text-white h-12 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Adding Vehicle...
                  </>
                ) : (
                  "Add Vehicle"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <ClientFooter />
    </div>
  )
}
