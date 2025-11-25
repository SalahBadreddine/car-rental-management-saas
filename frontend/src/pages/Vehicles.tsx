import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings, Fuel, Wind, X, Search, Car as CarIcon, MapPin, Check } from "lucide-react";
import { cars, brands, carTypes, locations } from "@/data/cars";
import { Car, CarFilters } from "@/types/car";

const Vehicles = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<CarFilters>({
    search: "",
    brand: null,
    type: null,
    startingPrice: null,
    endingPrice: null,
    location: null,
  });
  const [selectedCars, setSelectedCars] = useState<number[]>(() => {
    const stored = localStorage.getItem("compareCars");
    return stored ? JSON.parse(stored) : [];
  });
  const [priceInputs, setPriceInputs] = useState<{ starting: string; ending: string }>({
    starting: "",
    ending: "",
  });

  const handleFilterChange = (key: keyof CarFilters, value: any, keepOpen = false) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (!keepOpen) {
      setActiveFilter(null);
    }
  };

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !car.brand.toLowerCase().includes(searchLower) &&
          !car.type.toLowerCase().includes(searchLower) &&
          !`${car.brand} ${car.type}`.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Brand filter
      if (filters.brand && car.brand !== filters.brand) {
        return false;
      }

      // Type filter
      if (filters.type && car.type !== filters.type) {
        return false;
      }

      // Price range filter
      if (filters.startingPrice && car.price < filters.startingPrice) {
        return false;
      }
      if (filters.endingPrice && car.price > filters.endingPrice) {
        return false;
      }

      // Location filter
      if (filters.location && car.location !== filters.location) {
        return false;
      }

      return true;
    });
  }, [filters]);

  useEffect(() => {
    // Sync with localStorage
    localStorage.setItem("compareCars", JSON.stringify(selectedCars));
  }, [selectedCars]);

  const toggleCarSelection = (carId: number) => {
    setSelectedCars((prev) => {
      const newSelection = prev.includes(carId)
        ? prev.filter((id) => id !== carId)
        : prev.length < 4
        ? [...prev, carId]
        : prev;
      return newSelection;
    });
  };

  const handleViewDetails = (carId: number) => {
    navigate(`/vehicles/${carId}`);
  };

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
                Starting price {filters.startingPrice && `($${filters.startingPrice})`}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Min price"
                  value={priceInputs.starting}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPriceInputs((prev) => ({ ...prev, starting: value }));
                    handleFilterChange("startingPrice", value === "" ? null : (value ? Number(value) : null), true);
                  }}
                  onBlur={() => {
                    // Close popover when user clicks outside
                    setTimeout(() => setActiveFilter(null), 200);
                  }}
                  className="w-full"
                />
                {filters.startingPrice !== null && (
                  <button
                    onClick={() => {
                      setPriceInputs((prev) => ({ ...prev, starting: "" }));
                      handleFilterChange("startingPrice", null);
                    }}
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
                Ending price {filters.endingPrice && `($${filters.endingPrice})`}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Max price"
                  value={priceInputs.ending}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPriceInputs((prev) => ({ ...prev, ending: value }));
                    handleFilterChange("endingPrice", value === "" ? null : (value ? Number(value) : null), true);
                  }}
                  onBlur={() => {
                    // Close popover when user clicks outside
                    setTimeout(() => setActiveFilter(null), 200);
                  }}
                  className="w-full"
                />
                {filters.endingPrice !== null && (
                  <button
                    onClick={() => {
                      setPriceInputs((prev) => ({ ...prev, ending: "" }));
                      handleFilterChange("endingPrice", null);
                    }}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={activeFilter === "Location"} onOpenChange={(open) => setActiveFilter(open ? "Location" : null)}>
            <PopoverTrigger asChild>
              <button
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  filters.location
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : activeFilter === "Location"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Location {filters.location && `(${filters.location})`}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                {locations.map((location) => (
                  <button
                    key={location}
                    onClick={() => handleFilterChange("location", location)}
                    className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{location}</span>
                  </button>
                ))}
                {filters.location && (
                  <button
                    onClick={() => handleFilterChange("location", null)}
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
                {selectedCars.includes(car.id) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
              </button>
              
              <div className="bg-gradient-to-br from-card-dark to-card-dark/80 p-8 h-48 flex items-center justify-center">
                <CarIcon className="w-32 h-32 text-muted-foreground/30" />
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold">{car.brand}</h3>
                    <p className="text-muted-foreground text-sm">{car.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold text-xl">${car.price}</p>
                    <p className="text-muted-foreground text-xs">per day</p>
                  </div>
                </div>

                {/* Location */}
                {car.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{car.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Settings className="w-4 h-4" />
                    <span>{car.transmission === "Automatic" ? "Automat" : "Manual"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fuel className="w-4 h-4" />
                    <span>{car.fuel}</span>
                  </div>
                  {car.ac && (
                    <div className="flex items-center gap-1">
                      <Wind className="w-4 h-4" />
                      <span>Air Conditioner</span>
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

        {filteredCars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No cars found matching your criteria.</p>
          </div>
        )}

        {/* Compare Cars Button */}
        {selectedCars.length > 0 && (
          <div className="text-center mb-12">
            <Button
              onClick={() => {
                navigate("/compare", { state: { carIds: selectedCars } });
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
            {/* Toyota */}
            <div className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100 cursor-pointer">
              <img 
                src="https://logos-world.net/wp-content/uploads/2020/05/Toyota-Logo.png" 
                alt="Toyota" 
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
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
                  e.currentTarget.style.display = 'none';
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
                  e.currentTarget.style.display = 'none';
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
                  e.currentTarget.style.display = 'none';
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
                  e.currentTarget.style.display = 'none';
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
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Vehicles;
