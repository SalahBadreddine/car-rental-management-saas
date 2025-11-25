import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings, Fuel, Wind, Heart, X, Search, Car as CarIcon } from "lucide-react";
import { cars, brands, carTypes } from "@/data/cars";
import { Car, CarFilters } from "@/types/car";

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
  const [selectedCars, setSelectedCars] = useState<number[]>([]);

  const handleFilterChange = (key: keyof CarFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setActiveFilter(null);
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

      return true;
    });
  }, [filters]);

  const toggleCarSelection = (carId: number) => {
    setSelectedCars((prev) =>
      prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId]
    );
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
                  value={filters.startingPrice || ""}
                  onChange={(e) => handleFilterChange("startingPrice", e.target.value ? Number(e.target.value) : null)}
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
                Ending price {filters.endingPrice && `($${filters.endingPrice})`}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Max price"
                  value={filters.endingPrice || ""}
                  onChange={(e) => handleFilterChange("endingPrice", e.target.value ? Number(e.target.value) : null)}
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
          {filteredCars.map((car) => (
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
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Settings className="w-4 h-4" />
                    <span>{car.transmission}</span>
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
                // Navigate to compare page or show comparison
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
