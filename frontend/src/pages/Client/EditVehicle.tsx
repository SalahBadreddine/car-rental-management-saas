"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "@/components/Client/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Fuel, Wind, Users, CarIcon, Check, Loader2, Upload, X } from "lucide-react"
import ClientFooter from "@/components/Client/Footer"
import { carsApi, type Car, type CreateCarDto } from "@/services/carsApi"
import { useToast } from "@/hooks/use-toast"

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

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "rented", label: "Rented" },
  { value: "maintenance", label: "Maintenance" },
]

export default function EditVehicle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vehicle, setVehicle] = useState<Car | null>(null)
  

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
    status: "available",
  })
  

  const [primaryImage, setPrimaryImage] = useState<File | null>(null)
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string | null>(null)
  

  const [features, setFeatures] = useState({
    abs: false,
    airBags: false,
    cruiseControl: false,
    airConditioner: false,
    bluetooth: false,
    gps: false,
  })


  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) return
      
      setIsLoading(true)
      try {
        const data = await carsApi.getCarById(id)
        if (data) {
          setVehicle(data)
          

          setFormData({
            make: data.make || "",
            model: data.model || "",
            year: data.year || new Date().getFullYear(),
            licensePlate: data.license_plate || "",
            category: data.category || "",
            pricePerDay: data.price_per_day || 0,
            depositAmount: data.deposit_amount || 0,
            transmission: data.transmission || "",
            fuelType: data.fuel_type || "",
            seats: data.seats || 5,
            color: data.color || "",
            status: data.status || "available",
          })
          

          if (data.primary_image_url) {
            setPrimaryImagePreview(data.primary_image_url)
          }
          

          const carFeatures = Array.isArray(data.features) 
            ? data.features 
            : (typeof data.features === 'string' ? JSON.parse(data.features || '[]') : [])
          
          setFeatures({
            abs: carFeatures.includes('ABS'),
            airBags: carFeatures.includes('Air Bags'),
            cruiseControl: carFeatures.includes('Cruise Control'),
            airConditioner: carFeatures.includes('Air Conditioner'),
            bluetooth: carFeatures.includes('Bluetooth'),
            gps: carFeatures.includes('GPS Navigation'),
          })
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error)
        toast({
          title: "Error",
          description: "Failed to load vehicle data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVehicle()
  }, [id])


  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPrimaryImage(file)
      setPrimaryImagePreview(URL.createObjectURL(file))
    }
  }


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


  const handleSubmit = async () => {
    if (!id) return

    setIsSubmitting(true)
    try {
      const updateData: Partial<CreateCarDto> = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        licensePlate: formData.licensePlate,
        category: formData.category,
        pricePerDay: formData.pricePerDay,
        depositAmount: formData.depositAmount,
        transmission: formData.transmission || undefined,
        fuelType: formData.fuelType || undefined,
        seats: formData.seats,
        color: formData.color || undefined,
        features: getFeaturesList(),
      }

      const result = await carsApi.updateCar(
        id,
        updateData,
        primaryImage || undefined
      )

      if (result) {

        if (formData.status !== vehicle?.status) {
          await carsApi.updateCarStatus(id, formData.status)
        }
        
        toast({
          title: "Success!",
          description: "Vehicle updated successfully.",
        })
        navigate(`/client/vehicles/${id}`)
      } else {
        throw new Error("Failed to update")
      }
    } catch (error) {
      console.error('Error updating vehicle:', error)
      toast({
        title: "Error",
        description: "Failed to update vehicle.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#DC2626]" />
        </main>
        <ClientFooter />
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <CarIcon className="w-20 h-20 text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Vehicle Not Found</h2>
          <Button onClick={() => navigate('/client/vehicles')}>Back to Vehicles</Button>
        </main>
        <ClientFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8">Edit Vehicle</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-1 space-y-6">

            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-lg mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Make/Brand</label>
                  <Input 
                    placeholder="e.g., Toyota" 
                    value={formData.make}
                    onChange={(e) => handleChange("make", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Model</label>
                  <Input 
                    placeholder="e.g., Camry" 
                    value={formData.model}
                    onChange={(e) => handleChange("model", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Year</label>
                    <Input 
                      type="number" 
                      value={formData.year}
                      onChange={(e) => handleChange("year", parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">License Plate</label>
                    <Input 
                      value={formData.licensePlate}
                      onChange={(e) => handleChange("licensePlate", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
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
                    <label className="text-sm font-medium mb-2 block">Price/Day ($)</label>
                    <Input 
                      type="number" 
                      value={formData.pricePerDay}
                      onChange={(e) => handleChange("pricePerDay", parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Deposit ($)</label>
                    <Input 
                      type="number" 
                      value={formData.depositAmount}
                      onChange={(e) => handleChange("depositAmount", parseFloat(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>


            <Card className="p-6 border rounded-xl">
              <h3 className="font-bold text-lg mb-4">Vehicle Image</h3>
              <div 
                className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {primaryImagePreview ? (
                  <img src={primaryImagePreview} alt="Vehicle" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to change image</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </Card>
          </div>


          <div className="lg:col-span-2 space-y-6">

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
                    className="text-center"
                    value={formData.seats}
                    onChange={(e) => handleChange("seats", parseInt(e.target.value))}
                  />
                </div>
              </div>
            </Card>


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


            <div className="flex gap-4">
              <Button
                onClick={() => navigate(`/client/vehicles/${id}`)}
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
                    Saving...
                  </>
                ) : (
                  "Save Changes"
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
