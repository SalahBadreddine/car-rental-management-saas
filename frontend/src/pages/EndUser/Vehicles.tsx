"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Settings, Fuel, Wind, Search, CarIcon, MapPin, Check, Flame, Loader2, Building2 } from "lucide-react"
import { enduserCarsApi, type EndUserCar } from "@/services/enduserCarsApi"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/api"
import { useTenant } from "@/contexts/TenantContext"

const carTypes: Array<{ value: string; label: string; icon: string }> = [
  { value: "Cabriolet", label: "Cabriolet", icon: "🚗" },
  { value: "Pickup", label: "Pickup", icon: "🚚" },
  { value: "Sedan", label: "Sedan", icon: "🚙" },
  { value: "SUV", label: "SUV", icon: "🚙" },
  { value: "Minivan", label: "Minivan", icon: "🚐" },
]

interface CarFilters {
  search: string;
  brand: string | null;
  type: string | null;
  startingPrice: number | null;
  endingPrice: number | null;
  locationId: string | null;
}

interface CarWithDetails extends EndUserCar {
  tenantName?: string;
  locationName?: string;
  locationCity?: string;
}

const Vehicles = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { tenantId, tenantSlug, locations: tenantLocations } = useTenant()
  
  const [isLoading, setIsLoading] = useState(true)
  const [cars, setCars] = useState<CarWithDetails[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [filters, setFilters] = useState<CarFilters>({
    search: "",
    brand: null,
    type: null,
    startingPrice: null,
    endingPrice: null,
    locationId: null,
  })
  const [selectedCars, setSelectedCars] = useState<string[]>(() => {
    const stored = localStorage.getItem("compareCars")
    return stored ? JSON.parse(stored) : []
  })
  const [priceInputs, setPriceInputs] = useState<{ starting: string; ending: string }>({
    starting: "",
    ending: "",
  })

  const [isInitialLoad, setIsInitialLoad] = useState(true)



  useEffect(() => {
    if (!tenantId) return // Wait for tenant to load
    
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch cars from current tenant only
        const carsData = await enduserCarsApi.getCarsFromTenant(tenantId, {
          status: 'available',
          locationId: filters.locationId || undefined,
        })
        
        // Get unique brands from fetched cars
        const uniqueBrands = [...new Set(carsData.map(c => c.make))].filter(Boolean).sort()
        
        // Enrich cars with location details from tenant context
        const enrichedCars: CarWithDetails[] = carsData.map(car => {
          const loc = tenantLocations.find(l => l.id === car.location_id)
          return {
            ...car,
            locationName: loc?.name,
            locationCity: loc?.city,
          }
        })
        
        setCars(enrichedCars)
        setBrands(uniqueBrands)
        setIsInitialLoad(false)
      } catch (error) {
        console.error('Error fetching cars:', error)
        toast({
          title: "Error",
          description: "Failed to load vehicles. Please try again.",
          variant: "destructive",
        })
        setIsInitialLoad(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [tenantId, filters.locationId, tenantLocations, toast])


  useEffect(() => {
    // Skip if still on initial load or no tenantId
    if (isInitialLoad || !tenantId) return
    
    const searchCars = async () => {
      setIsLoading(true)
      try {
        const searchFilters: any = {
          status: 'available', // Only show available cars
        }
        
        if (filters.search) searchFilters.search = filters.search
        if (filters.brand) searchFilters.brand = filters.brand
        if (filters.type) searchFilters.type = filters.type
        if (filters.startingPrice !== null) searchFilters.startingPrice = filters.startingPrice
        if (filters.endingPrice !== null) searchFilters.endingPrice = filters.endingPrice
        if (filters.locationId) searchFilters.locationId = filters.locationId

        const results = await enduserCarsApi.getCarsFromTenant(tenantId, searchFilters)
        
        // Add location details to cars
        const enrichedCars: CarWithDetails[] = results.map(car => {
          const loc = tenantLocations.find(l => l.id === car.location_id)
          return {
            ...car,
            locationName: loc?.name,
            locationCity: loc?.city,
          }
        })
        
        setCars(enrichedCars)
      } catch (error) {
        console.error('Error searching cars:', error)
        toast({
          title: "Error",
          description: "Failed to search vehicles. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }


    const timeoutId = setTimeout(() => {
      searchCars()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters, isInitialLoad, tenantId, tenantLocations, toast])

  const handleFilterChange = (key: keyof CarFilters, value: any, keepOpen = false) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    if (!keepOpen) {
      setActiveFilter(null)
    }
  }
  useEffect(() => {
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
    navigate(`/${tenantSlug}/vehicles/${carId}`)
  }


  const onFireCars = useMemo(() => {
    return [...cars]
      .sort((a, b) => (b.rental_count || 0) - (a.rental_count || 0))
      .slice(0, 3)
      .map(car => car.id)
  }, [cars])

  if (isLoading && cars.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">

        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Search for a car and
            <br />
            Select a vehicle group
          </h1>
        </div>


        <div className="mb-8">
          <div className="relative max-w-4xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search a car name, type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                handleFilterChange("search", e.target.value)
              }}
              className="w-full pl-12 pr-4 py-6 text-lg rounded-lg border-2"
            />
          </div>
        </div>


        <div className="flex flex-wrap justify-center gap-4 mb-12">
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
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {brands.length > 0 ? (
                  brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleFilterChange("brand", brand)}
                      className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors"
                    >
                      {brand}
                    </button>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm px-4 py-2">No brands available</p>
                )}
                {filters.brand && (
                  <button
                    onClick={() => handleFilterChange("brand", null)}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>

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
                    onClick={() => handleFilterChange("type", null)}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Popover
            open={activeFilter === "Starting price"}
            onOpenChange={(open) => setActiveFilter(open ? "Starting price" : null)}
          >
            <PopoverTrigger asChild>
              <button
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  filters.startingPrice
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : activeFilter === "Starting price"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Starting price {filters.startingPrice && `(${filters.startingPrice} DZD)`}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Min price"
                  value={priceInputs.starting}
                  onChange={(e) => {
                    const value = e.target.value
                    setPriceInputs((prev) => ({ ...prev, starting: value }))
                    handleFilterChange("startingPrice", value === "" ? null : value ? Number(value) : null, true)
                  }}
                  onBlur={() => {
                    setTimeout(() => setActiveFilter(null), 200)
                  }}
                  className="w-full"
                />
                {filters.startingPrice !== null && (
                  <button
                    onClick={() => {
                      setPriceInputs((prev) => ({ ...prev, starting: "" }))
                      handleFilterChange("startingPrice", null)
                    }}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Popover
            open={activeFilter === "Ending price"}
            onOpenChange={(open) => setActiveFilter(open ? "Ending price" : null)}
          >
            <PopoverTrigger asChild>
              <button
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  filters.endingPrice
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : activeFilter === "Ending price"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Ending price {filters.endingPrice && `(${filters.endingPrice} DZD)`}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Max price"
                  value={priceInputs.ending}
                  onChange={(e) => {
                    const value = e.target.value
                    setPriceInputs((prev) => ({ ...prev, ending: value }))
                    handleFilterChange("endingPrice", value === "" ? null : value ? Number(value) : null, true)
                  }}
                  onBlur={() => {
                    setTimeout(() => setActiveFilter(null), 200)
                  }}
                  className="w-full"
                />
                {filters.endingPrice !== null && (
                  <button
                    onClick={() => {
                      setPriceInputs((prev) => ({ ...prev, ending: "" }))
                      handleFilterChange("endingPrice", null)
                    }}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>


        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}


        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {cars.map((car) => (
              <div
                key={car.id}
                className={`bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all relative border-2 ${
                  selectedCars.includes(car.id) ? "border-primary" : "border-transparent"
                }`}
              >

                {onFireCars.includes(car.id) && (
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    <Flame className="w-3 h-3" />
                    On Fire
                  </div>
                )}


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


                <div className="w-full h-48 relative overflow-hidden bg-gradient-to-br from-card-dark to-card-dark/80">
                  {car.primary_image_url ? (
                    <img
                      src={car.primary_image_url}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.stopPropagation()
                        e.currentTarget.style.display = "none"
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                        if (fallback) {
                          fallback.classList.remove("hidden")
                        }
                      }}
                      onLoad={(e) => {
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                        if (fallback) {
                          fallback.classList.add("hidden")
                        }
                      }}
                    />
                  ) : null}
                  <CarIcon className={`w-32 h-32 text-muted-foreground/30 absolute inset-0 m-auto ${car.primary_image_url ? "hidden" : ""}`} />
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-heading text-xl font-bold">{car.make}</h3>
                      <p className="text-muted-foreground text-sm">{car.model} {car.year ? `(${car.year})` : ""}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-primary font-bold text-xl">{car.price_per_day} DZD</p>
                      <p className="text-muted-foreground text-xs">per day</p>
                    </div>
                  </div>


                  <div className="mb-3 space-y-1">
                    {car.tenantName && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        <span>{car.tenantName}</span>
                      </div>
                    )}
                    {(car.locationName || car.locationCity) && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{car.locationName || car.locationCity}{car.locationName && car.locationCity ? `, ${car.locationCity}` : ""}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Settings className="w-4 h-4" />
                      <span>{car.transmission === "Automatic" ? "Automat" : "Manual"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="w-4 h-4" />
                      <span>{car.fuel_type}</span>
                    </div>
                    {car.features?.includes("AC") && (
                      <div className="flex items-center gap-1">
                        <Wind className="w-4 h-4" />
                        <span>AC</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleCarSelection(car.id)}
                      className={`flex-1 font-semibold rounded-lg h-11 ${
                        selectedCars.includes(car.id)
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      {selectedCars.includes(car.id) ? "Selected" : "Add to compare"}
                    </Button>
                    <Button
                      onClick={() => handleViewDetails(car.id)}
                      className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg h-11"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && cars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No cars found matching your criteria.</p>
          </div>
        )}


        {selectedCars.length > 0 && (
          <div className="text-center mb-12">
            <Button
              onClick={() => {
                navigate("/compare", { state: { carIds: selectedCars } })
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-12 py-6 rounded-lg text-lg"
            >
              Compare cars ({selectedCars.length})
            </Button>
          </div>
        )}


        <div className="bg-card rounded-2xl p-8 mb-12">
          <div className="flex flex-wrap justify-center items-center gap-12">
            {/* Toyota */}
            <div className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100 cursor-pointer">
              <img
                src="https://logos-world.net/wp-content/uploads/2020/05/Toyota-Logo.png"
                alt="Toyota"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>

            {/* Ford */}
            <div className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100 cursor-pointer">
              <img
                src="https://logos-world.net/wp-content/uploads/2020/05/Ford-Logo.png"
                alt="Ford"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>

            {/* Mercedes-Benz */}
            <div className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100 cursor-pointer">
              <img
                src="https://logos-world.net/wp-content/uploads/2020/05/Mercedes-Benz-Logo.png"
                alt="Mercedes-Benz"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>

            {/* Jeep */}
            <div className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100 cursor-pointer">
              <img
                src="https://logos-world.net/wp-content/uploads/2020/05/Jeep-Logo.png"
                alt="Jeep"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>

            {/* BMW */}
            <div className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100 cursor-pointer">
              <img
                src="https://logos-world.net/wp-content/uploads/2020/05/BMW-Logo.png"
                alt="BMW"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>

            {/* Audi */}
            <div className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100 cursor-pointer">
              <img
                src="https://logos-world.net/wp-content/uploads/2020/05/Audi-Logo.png"
                alt="Audi"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Vehicles
