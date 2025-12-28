"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from "@/components/Client/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Settings, Fuel, Wind, Search, CarIcon, MapPin, Check, Plus, Loader2, Trash2 } from "lucide-react"
import ClientFooter from "@/components/Client/Footer"
import { carsApi, type Car, type SearchFilters } from "@/services/carsApi"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

// Static filter options (categories)
const carTypes: Array<{ value: string; label: string; icon: string }> = [
  { value: "Sedan", label: "Sedan", icon: "🚙" },
  { value: "SUV", label: "SUV", icon: "🚙" },
  { value: "Sport", label: "Sport", icon: "🏎️" },
  { value: "Van", label: "Van", icon: "🚐" },
  { value: "Pickup", label: "Pickup", icon: "🚚" },
  { value: "Luxury", label: "Luxury", icon: "✨" },
]

// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

const Vehicles = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { selectedLocation } = useAuth()
  
  // State
  const [cars, setCars] = useState<Car[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    brand: undefined,
    type: undefined,
    startingPrice: undefined,
    endingPrice: undefined,
    status: undefined,
  })
  const [selectedCars, setSelectedCars] = useState<string[]>(() => {
    const stored = localStorage.getItem("compareCars")
    return stored ? JSON.parse(stored) : []
  })
  const [priceInputs, setPriceInputs] = useState<{ starting: string; ending: string }>({
    starting: "",
    ending: "",
  })

  // Fetch cars on mount or when location changes
  useEffect(() => {
    const fetchCars = async () => {
      setIsLoading(true)
      try {
        const [carsData, brandsData] = await Promise.all([
          carsApi.getAllCars(selectedLocation || undefined),
          carsApi.getBrands(),
        ])
        setCars(carsData)
        setBrands(brandsData)
      } catch (error) {
        console.error('Error fetching cars:', error)
        toast({
          title: "Error",
          description: "Failed to load vehicles. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCars()
  }, [selectedLocation])

  // Handle filter change
  const handleFilterChange = (key: keyof SearchFilters, value: any, keepOpen = false) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
    if (!keepOpen) {
      setActiveFilter(null)
    }
  }

  // Apply search with API
  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const searchFilters: SearchFilters = {
        ...filters,
        search: searchQuery,
      }
      const results = await carsApi.searchCars(searchFilters)
      setCars(results)
    } catch (error) {
      console.error('Error searching cars:', error)
      toast({
        title: "Error",
        description: "Failed to search vehicles.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter cars locally (for instant feedback)
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (
          !car.make.toLowerCase().includes(searchLower) &&
          !car.model.toLowerCase().includes(searchLower) &&
          !car.category.toLowerCase().includes(searchLower) &&
          !`${car.make} ${car.model}`.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      // Brand filter
      if (filters.brand && car.make !== filters.brand) {
        return false
      }

      // Type filter
      if (filters.type && car.category !== filters.type) {
        return false
      }

      // Price range filter
      if (filters.startingPrice && car.price_per_day < filters.startingPrice) {
        return false
      }
      if (filters.endingPrice && car.price_per_day > filters.endingPrice) {
        return false
      }

      return true
    })
  }, [cars, filters])

  useEffect(() => {
    // Sync with localStorage
    localStorage.setItem("compareCars", JSON.stringify(selectedCars))
  }, [selectedCars])

  const toggleCarSelection = (carId: string) => {
    setSelectedCars((prev) => {
      const newSelection = prev.includes(carId)
        ? prev.filter((id) => id !== carId)
        : prev.length < 4
          ? [...prev, carId]
          : prev
      return newSelection
    })
  }

  const handleViewDetails = (carId: string) => {
    navigate(`/client/vehicles/${carId}`)
  }

  const handleDeleteCar = async (carId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this vehicle?')) {
      return
    }

    try {
      const success = await carsApi.deleteCar(carId)
      if (success) {
        setCars(prev => prev.filter(car => car.id !== carId))
        toast({
          title: "Success",
          description: "Vehicle deleted successfully.",
        })
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error: any) {
      const message = error?.message || ''
      if (message.includes('foreign key') || message.includes('reservations')) {
        toast({
          title: "Cannot Delete",
          description: "This vehicle has existing reservations and cannot be deleted. Cancel or complete all reservations first.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete vehicle.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Manage Your Fleet
            <br />
            <span className="text-muted-foreground text-2xl">View and manage all vehicles</span>
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-4xl mx-auto flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by make, model, or category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleFilterChange("search", e.target.value)
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-6 text-lg rounded-lg border-2"
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-[#DC2626] hover:bg-[#B71C1C] text-white px-8"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {/* Brand Filter */}
          <Popover open={activeFilter === "Brand"} onOpenChange={(open) => setActiveFilter(open ? "Brand" : null)}>
            <PopoverTrigger asChild>
              <button
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  filters.brand
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : activeFilter === "Brand"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Brand {filters.brand && `(${filters.brand})`}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handleFilterChange("brand", brand)}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors"
                  >
                    {brand}
                  </button>
                ))}
                {filters.brand && (
                  <button
                    onClick={() => handleFilterChange("brand", undefined)}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Type Filter */}
          <Popover open={activeFilter === "Type"} onOpenChange={(open) => setActiveFilter(open ? "Type" : null)}>
            <PopoverTrigger asChild>
              <button
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  filters.type
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : activeFilter === "Type"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Type {filters.type && `(${filters.type})`}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                {carTypes.map((carType) => (
                  <button
                    key={carType.value}
                    onClick={() => handleFilterChange("type", carType.value)}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <span className="text-xl">{carType.icon}</span>
                    <span>{carType.label}</span>
                  </button>
                ))}
                {filters.type && (
                  <button
                    onClick={() => handleFilterChange("type", undefined)}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Price Range Filter */}
          <Popover open={activeFilter === "Price"} onOpenChange={(open) => setActiveFilter(open ? "Price" : null)}>
            <PopoverTrigger asChild>
              <button
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  filters.startingPrice || filters.endingPrice
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : activeFilter === "Price"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Price Range {(filters.startingPrice || filters.endingPrice) && "✓"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Min Price ($/day)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={priceInputs.starting}
                    onChange={(e) => {
                      setPriceInputs((prev) => ({ ...prev, starting: e.target.value }))
                      handleFilterChange("startingPrice", e.target.value ? Number(e.target.value) : undefined, true)
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Max Price ($/day)</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={priceInputs.ending}
                    onChange={(e) => {
                      setPriceInputs((prev) => ({ ...prev, ending: e.target.value }))
                      handleFilterChange("endingPrice", e.target.value ? Number(e.target.value) : undefined, true)
                    }}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={() => {
                    handleFilterChange("startingPrice", undefined)
                    handleFilterChange("endingPrice", undefined)
                    setPriceInputs({ starting: "", ending: "" })
                    setActiveFilter(null)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Price Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Status Filter */}
          <Popover open={activeFilter === "Status"} onOpenChange={(open) => setActiveFilter(open ? "Status" : null)}>
            <PopoverTrigger asChild>
              <button
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  filters.status
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : activeFilter === "Status"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Status {filters.status && `(${filters.status})`}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                {['available', 'rented', 'maintenance'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleFilterChange("status", status)}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors capitalize"
                  >
                    {status}
                  </button>
                ))}
                {filters.status && (
                  <button
                    onClick={() => handleFilterChange("status", undefined)}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {isLoading ? "Loading..." : `${filteredCars.length} vehicle${filteredCars.length !== 1 ? 's' : ''} found`}
          </p>
          <Button
            onClick={() => navigate(`/client/add-vehicle`)}
            className="bg-[#DC2626] hover:bg-[#B71C1C] text-white font-semibold px-6 py-3 rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[#DC2626]" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCars.length === 0 && (
          <div className="text-center py-20">
            <CarIcon className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
            <p className="text-muted-foreground mb-6">
              {cars.length === 0 
                ? "You haven't added any vehicles yet. Add your first vehicle to get started."
                : "Try adjusting your filters or search query."}
            </p>
            <Button
              onClick={() => navigate('/client/add-vehicle')}
              className="bg-[#DC2626] hover:bg-[#B71C1C] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Vehicle
            </Button>
          </div>
        )}

        {/* Vehicle Grid */}
        {!isLoading && filteredCars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredCars.map((car) => (
              <div
                key={car.id}
                className={`bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all relative border-2 ${
                  selectedCars.includes(car.id) ? "border-primary" : "border-transparent"
                }`}
              >
                {/* Selection Checkbox */}
                <button
                  onClick={() => toggleCarSelection(car.id)}
                  className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-md ${
                    selectedCars.includes(car.id)
                      ? "bg-red-500 text-white"
                      : "bg-white/90 hover:bg-white text-muted-foreground"
                  }`}
                >
                  <Check className="w-5 h-5" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteCar(car.id, e)}
                  className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 hover:bg-red-500 hover:text-white text-muted-foreground transition-colors shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Car Image - 16:9 aspect ratio */}
                <div className="relative aspect-video bg-gradient-to-br from-card-dark to-card-dark/80 overflow-hidden">
                  {car.primary_image_url ? (
                    <img
                      src={car.primary_image_url}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CarIcon className="w-24 h-24 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-heading text-xl font-bold">{car.make} {car.model}</h3>
                      <p className="text-muted-foreground text-sm">{car.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold text-xl">{formatCurrency(car.price_per_day)}</p>
                      <p className="text-muted-foreground text-xs">per day</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      car.status === 'available' ? 'bg-green-100 text-green-800' :
                      car.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {car.status}
                    </span>
                  </div>

                  {/* Specs */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <Settings className="w-4 h-4" />
                      <span>{car.transmission || 'Auto'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="w-4 h-4" />
                      <span>{car.fuel_type || 'Petrol'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wind className="w-4 h-4" />
                      <span>{car.seats || 5} seats</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewDetails(car.id)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => navigate(`/client/vehicles/${car.id}/edit`)}
                      variant="outline"
                      className="flex-1"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compare Bar */}
        {selectedCars.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-card shadow-xl rounded-full px-8 py-4 flex items-center gap-4 border-2 border-primary z-50">
            <span className="font-medium">{selectedCars.length} car{selectedCars.length > 1 ? 's' : ''} selected</span>
            <Button
              onClick={() => {
                setSelectedCars([])
                localStorage.removeItem("compareCars")
              }}
              variant="outline"
              size="sm"
            >
              Clear
            </Button>
            <Button
              onClick={() => navigate("/client/compare")}
              className="bg-[#DC2626] hover:bg-[#B71C1C] text-white"
              disabled={selectedCars.length < 2}
            >
              Compare
            </Button>
          </div>
        )}
      </main>

      <ClientFooter />
    </div>
  )
}

export default Vehicles
