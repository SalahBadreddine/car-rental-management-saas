import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings, Fuel, Wind, Heart, X, Search, Car as CarIcon } from "lucide-react";
import { carsApi, Car } from "@/services/carsApi";

interface CarFilters {
  search: string;
  brand: string | null;
  type: string | null;
  startingPrice: number | null;
  endingPrice: number | null;
}

const Vehicles = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<CarFilters>({
    search: "",
    brand: null,
    type: null,
    startingPrice: null,
    endingPrice: null,
  });
  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  
  // State for data from API
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [carsData, brandsData, categoriesData] = await Promise.all([
          carsApi.getAllCars(),
          carsApi.getBrands(),
          carsApi.getCategories(),
        ]);
        
        setCars(carsData);
        setBrands(brandsData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        setError('Failed to load cars. Please try again.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch filtered cars whenever filters change
  useEffect(() => {
    const fetchFilteredCars = async () => {
      try {
        setLoading(true);
        const filteredCars = await carsApi.searchCars({
          search: filters.search || undefined,
          brand: filters.brand || undefined,
          type: filters.type || undefined,
          startingPrice: filters.startingPrice || undefined,
          endingPrice: filters.endingPrice || undefined,
        });
        
        setCars(filteredCars);
        setError(null);
      } catch (err) {
        setError('Failed to search cars. Please try again.');
        console.error('Error searching cars:', err);
      } finally {
        setLoading(false);
      }
    };

    // Check if there are active filters
    const hasActiveFilters = filters.search || filters.brand || filters.type || 
                            filters.startingPrice !== null || filters.endingPrice !== null;
    
    if (hasActiveFilters) {
      fetchFilteredCars();
    } else {
      // No filters - reload all cars
      const reloadAllCars = async () => {
        try {
          setLoading(true);
          const allCars = await carsApi.getAllCars();
          setCars(allCars);
          setError(null);
        } catch (err) {
          setError('Failed to load cars. Please try again.');
          console.error('Error loading cars:', err);
        } finally {
          setLoading(false);
        }
      };
      
      reloadAllCars();
    }
  }, [filters]);

  const handleFilterChange = (key: keyof CarFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setActiveFilter(null);
  };

  const toggleCarSelection = (carId: string) => {
    setSelectedCars((prev) =>
      prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId]
    );
  };

  const handleViewDetails = (carId: string) => {
    navigate(`/vehicles/${carId}`);
  };

  if (loading && cars.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Loading cars...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Search for a car and<br />Select a vehicle group
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-4xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search a car name, type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleFilterChange("search", e.target.value);
              }}
              className="w-full pl-12 pr-4 py-6 text-lg rounded-lg border-2"
            />
          </div>
        </div>

        {/* Filter Controls */}
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
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleFilterChange("type", category)}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors"
                  >
                    {category}
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

          <Popover open={activeFilter === "Starting price"} onOpenChange={(open) => setActiveFilter(open ? "Starting price" : null)}>
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
                Starting price {filters.startingPrice && `(${filters.startingPrice} DA)`}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Min price (press Enter)"
                  defaultValue={filters.startingPrice || ""}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value;
                      handleFilterChange("startingPrice", value ? Number(value) : null);
                    }
                  }}
                  className="w-full"
                />
                {filters.startingPrice && (
                  <button
                    onClick={() => handleFilterChange("startingPrice", null)}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={activeFilter === "Ending price"} onOpenChange={(open) => setActiveFilter(open ? "Ending price" : null)}>
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
                Ending price {filters.endingPrice && `(${filters.endingPrice} DA)`}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Max price (press Enter)"
                  defaultValue={filters.endingPrice || ""}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value;
                      handleFilterChange("endingPrice", value ? Number(value) : null);
                    }
                  }}
                  className="w-full"
                />
                {filters.endingPrice && (
                  <button
                    onClick={() => handleFilterChange("endingPrice", null)}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {cars.map((car) => (
            <div
              key={car.id}
              className={`bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all relative border-2 ${
                selectedCars.includes(car.id) ? "border-primary" : "border-transparent"
              }`}
            >
              <button
                onClick={() => toggleCarSelection(car.id)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-md"
              >
                {selectedCars.includes(car.id) ? (
                  <X className="w-5 h-5 text-primary" />
                ) : (
                  <Heart className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              
              <div className="bg-gradient-to-br from-card-dark to-card-dark/80 p-8 h-48 flex items-center justify-center">
                {car.primary_image_url ? (
                  <img 
                    src={car.primary_image_url} 
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <CarIcon className="w-32 h-32 text-muted-foreground/30" />
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold">{car.make}</h3>
                    <p className="text-muted-foreground text-sm">{car.model}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold text-xl">{car.price_per_day} DA</p>
                    <p className="text-muted-foreground text-xs">per day</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Settings className="w-4 h-4" />
                    <span>{car.transmission}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fuel className="w-4 h-4" />
                    <span>{car.fuel_type}</span>
                  </div>
                  {car.features?.includes("Air Conditioner") && (
                    <div className="flex items-center gap-1">
                      <Wind className="w-4 h-4" />
                      <span>AC</span>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => handleViewDetails(car.id)}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg h-11"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        {cars.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No cars found matching your criteria.</p>
          </div>
        )}

        {/* Compare Cars Button */}
        {selectedCars.length > 0 && (
          <div className="text-center mb-12">
            <Button
              onClick={() => {
                console.log("Compare cars:", selectedCars);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-12 py-6 rounded-lg text-lg"
            >
              Compare cars ({selectedCars.length})
            </Button>
          </div>
        )}

        {/* Brand Logos */}
        <div className="bg-card rounded-2xl p-8 mb-12">
          <div className="flex flex-wrap justify-center items-center gap-12">
            {brands.map((brand) => (
              <div
                key={brand}
                className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100 cursor-pointer"
              >
                <div className="text-2xl font-bold text-foreground">{brand}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Vehicles;