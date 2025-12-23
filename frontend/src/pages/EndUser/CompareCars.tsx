import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { X, Plus, ArrowLeft, Check, X as XIcon, Star, MapPin, Calendar, Users, Settings, Fuel, Wind, Palette, Gauge, Car as CarIcon } from "lucide-react";
import { cars } from "@/data/cars";
import { Car } from "@/types/car";

const CompareCars = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCarIds, setSelectedCarIds] = useState<number[]>(() => {
    // Get car IDs from location state or localStorage
    const state = location.state as { carIds?: number[] } | null;
    if (state?.carIds) return state.carIds;
    const stored = localStorage.getItem("compareCars");
    return stored ? JSON.parse(stored) : [];
  });

  const selectedCars = useMemo(() => {
    return selectedCarIds.map((id) => cars.find((car) => car.id === id)).filter(Boolean) as Car[];
  }, [selectedCarIds]);

  const maxCars = 4;

  const handleRemoveCar = (carId: number) => {
    const newIds = selectedCarIds.filter((id) => id !== carId);
    setSelectedCarIds(newIds);
    localStorage.setItem("compareCars", JSON.stringify(newIds));
  };

  const handleAddCar = () => {
    navigate("/vehicles", { state: { fromCompare: true } });
  };

  const handleClearAll = () => {
    setSelectedCarIds([]);
    localStorage.removeItem("compareCars");
  };

  const getBestValue = (attribute: keyof Car, type: "min" | "max" = "min") => {
    if (selectedCars.length === 0) return null;
    const values = selectedCars.map((car) => {
      if (attribute === "price") return car.price;
      if (attribute === "year") return car.year || 0;
      if (attribute === "mileage") return car.mileage || 0;
      return 0;
    });
    return type === "min" ? Math.min(...values) : Math.max(...values);
  };

  // Empty state - no cars selected
  if (selectedCars.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            onClick={() => navigate("/vehicles")}
            className="mb-8 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search results
          </Button>

          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <XIcon className="w-16 h-16 text-muted-foreground" />
              </div>
              <h1 className="font-heading text-3xl font-bold mb-4">No cars selected for comparison yet</h1>
              <p className="text-muted-foreground mb-8">
                Go back to results and tap "Add to compare" to start comparing cars.
              </p>
              <Button onClick={() => navigate("/vehicles")} className="bg-primary hover:bg-primary/90">
                Back to search results
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Need at least 2 cars to compare
  if (selectedCars.length === 1) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            onClick={() => navigate("/vehicles")}
            className="mb-8 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search results
          </Button>

          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <h1 className="font-heading text-3xl font-bold mb-4">Add at least one more car to compare</h1>
              <p className="text-muted-foreground mb-8">
                Select another car from the search results to start comparing.
              </p>
              <Button onClick={() => navigate("/vehicles")} className="bg-primary hover:bg-primary/90">
                Back to search results
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const bestPrice = getBestValue("price", "min");
  const bestYear = getBestValue("year", "max");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/vehicles")}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to results
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-heading text-4xl font-bold mb-2">Compare cars</h1>
              <p className="text-muted-foreground">
                Select up to 4 cars and compare their features, pricing, and policies.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClearAll}>
                Clear all
              </Button>
            </div>
          </div>
        </div>

        {/* Car Slots Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {selectedCars.map((car) => (
            <div key={car.id} className="bg-card rounded-lg p-4 border-2 border-primary/20 relative">
              <button
                onClick={() => handleRemoveCar(car.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="bg-gradient-to-br from-card-dark to-card-dark/80 rounded-lg p-4 h-32 flex items-center justify-center mb-3">
                <CarIcon className="w-16 h-16 text-muted-foreground/30" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-1">{car.brand} {car.type}</h3>
              {car.year && <p className="text-sm text-muted-foreground mb-2">{car.year}</p>}
              <p className="text-primary font-bold text-xl mb-4">${car.price}/day</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/vehicles/${car.id}`)}
                  className="flex-1 text-xs py-2"
                >
                  View details
                </Button>
                <Button
                  onClick={() => navigate(`/rent/${car.id}`)}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-2"
                >
                  Book now
                </Button>
              </div>
            </div>
          ))}
          {selectedCars.length < maxCars && (
            <button
              onClick={handleAddCar}
              className="bg-muted hover:bg-muted/80 rounded-lg p-4 border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 transition-colors min-h-[200px]"
            >
              <Plus className="w-8 h-8 text-muted-foreground" />
              <span className="text-muted-foreground font-medium text-sm">Add another car</span>
            </button>
          )}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Basic Info Section */}
            <div className="bg-card rounded-lg p-6 mb-6">
              <h2 className="font-heading text-2xl font-bold mb-6">Basic Info</h2>
              <div className="space-y-4">
                <ComparisonRow
                  label="Brand"
                  values={selectedCars.map((car) => car.brand)}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Model/Type"
                  values={selectedCars.map((car) => car.type)}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Year"
                  values={selectedCars.map((car) => car.year?.toString() || "N/A")}
                  highlightValue={bestYear?.toString()}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Transmission"
                  values={selectedCars.map((car) => car.transmission)}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Fuel Type"
                  values={selectedCars.map((car) => car.fuel)}
                  numCars={selectedCars.length}
                />
              </div>
            </div>

            {/* Price & Payments Section */}
            <div className="bg-card rounded-lg p-6 mb-6">
              <h2 className="font-heading text-2xl font-bold mb-6">Price & Payments</h2>
              <div className="space-y-4">
                <ComparisonRow
                  label="Price per day"
                  values={selectedCars.map((car) => `$${car.price}`)}
                  highlightValue={bestPrice ? `$${bestPrice}` : undefined}
                  highlightLabel="Best price"
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Included mileage"
                  values={selectedCars.map(() => "200 km/day")}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Extra km fee"
                  values={selectedCars.map(() => "$0.50/km")}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Deposit required"
                  values={selectedCars.map(() => "Yes - $200")}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Payment options"
                  values={selectedCars.map(() => "Card, Cash at pickup")}
                  numCars={selectedCars.length}
                />
              </div>
            </div>

            {/* Capacity & Comfort Section */}
            <div className="bg-card rounded-lg p-6 mb-6">
              <h2 className="font-heading text-2xl font-bold mb-6">Capacity & Comfort</h2>
              <div className="space-y-4">
                <ComparisonRow
                  label="Seats"
                  values={selectedCars.map((car) => car.seats?.toString() || "N/A")}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Doors"
                  values={selectedCars.map(() => "4")}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Luggage"
                  values={selectedCars.map(() => "2 large + 1 small")}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Air Conditioning"
                  values={selectedCars.map((car) => car.ac ? "Yes" : "No")}
                  iconValues={selectedCars.map((car) => car.ac)}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Bluetooth"
                  values={selectedCars.map(() => "Yes")}
                  iconValues={selectedCars.map(() => true)}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="USB Ports"
                  values={selectedCars.map(() => "Yes")}
                  iconValues={selectedCars.map(() => true)}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="GPS Navigation"
                  values={selectedCars.map(() => "Yes")}
                  iconValues={selectedCars.map(() => true)}
                  numCars={selectedCars.length}
                />
              </div>
            </div>

            {/* Policies Section */}
            <div className="bg-card rounded-lg p-6 mb-6">
              <h2 className="font-heading text-2xl font-bold mb-6">Policies</h2>
              <div className="space-y-4">
                <ComparisonRow
                  label="Fuel policy"
                  values={selectedCars.map(() => "Full-to-Full")}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Cancellation"
                  values={selectedCars.map(() => "Free until 24h before")}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Minimum driver age"
                  values={selectedCars.map(() => "21 years")}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Additional driver"
                  values={selectedCars.map(() => "Yes - $10/day")}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Insurance coverage"
                  values={selectedCars.map(() => "Full coverage, $500 excess")}
                  numCars={selectedCars.length}
                />
              </div>
            </div>

            {/* Pickup / Drop-off Section */}
            <div className="bg-card rounded-lg p-6 mb-6">
              <h2 className="font-heading text-2xl font-bold mb-6">Pickup / Drop-off</h2>
              <div className="space-y-4">
                <ComparisonRow
                  label="Location"
                  values={selectedCars.map(() => "Main Office - Downtown")}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Pickup hours"
                  values={selectedCars.map(() => "8:00 AM - 8:00 PM")}
                  numCars={selectedCars.length}
                />
                <ComparisonRow
                  label="Drop-off flexibility"
                  values={selectedCars.map(() => "Same or different location")}
                  numCars={selectedCars.length}
                />
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Comparison Row Component
interface ComparisonRowProps {
  label: string;
  values: string[];
  highlightValue?: string;
  highlightLabel?: string;
  iconValues?: boolean[];
  numCars: number;
}

const ComparisonRow = ({ label, values, highlightValue, highlightLabel, iconValues, numCars }: ComparisonRowProps) => {
  const getGridClass = () => {
    const totalCols = numCars + 1;
    if (totalCols === 2) return "grid-cols-2";
    if (totalCols === 3) return "grid-cols-3";
    if (totalCols === 4) return "grid-cols-4";
    if (totalCols === 5) return "grid-cols-5";
    return "grid-cols-2";
  };

  return (
    <div className={`grid ${getGridClass()} gap-4 items-center py-2 border-b border-border last:border-0`}>
      <div className="font-semibold text-sm">{label}</div>
      {values.map((value, index) => {
        const isHighlighted = highlightValue && value === highlightValue;
        const showIcon = iconValues && iconValues[index] !== undefined;
        return (
          <div
            key={index}
            className={`text-sm ${isHighlighted ? "text-primary font-bold" : ""}`}
          >
            {showIcon ? (
              <div className="flex items-center gap-2">
                {iconValues![index] ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <XIcon className="w-4 h-4 text-red-500" />
                )}
                <span>{value}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span>{value}</span>
                {isHighlighted && highlightLabel && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {highlightLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CompareCars;

