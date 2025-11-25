import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Settings, Fuel, Wind, Users, Calendar, Gauge, Palette, ArrowLeft, Car as CarIcon, ChevronRight, Check } from "lucide-react";
import { cars } from "@/data/cars";
import { Car } from "@/types/car";

const CarDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  
  // Safely parse the car ID
  const carId = id ? parseInt(id, 10) : null;
  const car: Car | undefined = carId ? cars.find((c) => c.id === carId) : undefined;
  
  // Car equipment list
  const carEquipment = [
    "ABS",
    "Air Bags",
    "Cruise Control",
    "GPS",
    "Air Conditioner",
    "Bluetooth",
    "USB Ports",
    "Parking Sensors"
  ];

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold mb-4">Car Not Found</h1>
            <p className="text-muted-foreground mb-8">The car you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/vehicles")} className="bg-primary hover:bg-primary/90">
              Back to Vehicles
            </Button>
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
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/vehicles")}
          className="mb-8 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vehicles
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Car Image & Availability */}
          <div className="space-y-6">
            {/* Availability Badge */}
            <div className="flex items-center gap-4">
              <span className="px-4 py-1 bg-green-500 text-white rounded text-sm font-semibold">
                Available
              </span>
            </div>

            {/* Car Name and Price */}
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">
                {car.brand}
              </h1>
              <p className="text-3xl text-primary font-bold mb-6">
                ${car.price} <span className="text-lg text-muted-foreground">/ day</span>
              </p>
            </div>

            {/* Main Car Image */}
            <div className="bg-gradient-to-br from-card-dark to-card-dark/80 rounded-2xl p-12 h-96 flex items-center justify-center">
              <CarIcon className="w-64 h-64 text-muted-foreground/30" />
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card-dark rounded-lg p-4 h-24 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <CarIcon className="w-12 h-12 text-muted-foreground/30" />
                </div>
              ))}
            </div>

            {/* Availability Section with Calendar */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-bold flex items-center gap-2">
                  Availability
                  <ChevronRight className="w-5 h-5" />
                </h2>
              </div>
              <CalendarComponent
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => {
                  try {
                    if (dates) {
                      const dateArray = Array.isArray(dates) ? dates : [dates];
                      setSelectedDates(dateArray.filter((date): date is Date => date instanceof Date));
                    } else {
                      setSelectedDates([]);
                    }
                  } catch (error) {
                    console.error("Error selecting dates:", error);
                    setSelectedDates([]);
                  }
                }}
                className="rounded-md border-0"
              />
            </div>
          </div>

          {/* Right Column - Technical Specs & Equipment */}
          <div className="space-y-6">

            {/* Technical Specification */}
            <div>
              <h2 className="font-heading text-xl font-bold mb-4">Technical Specification</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-lg p-4 flex items-center gap-3 border border-border">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gear Box</p>
                    <p className="font-semibold">{car.transmission === "Automatic" ? "Automat" : "Manual"}</p>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4 flex items-center gap-3 border border-border">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Fuel className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel</p>
                    <p className="font-semibold">{car.fuel}</p>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4 flex items-center gap-3 border border-border">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CarIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Doors</p>
                    <p className="font-semibold">4</p>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4 flex items-center gap-3 border border-border">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wind className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Air Conditioner</p>
                    <p className="font-semibold">{car.ac ? "Yes" : "No"}</p>
                  </div>
                </div>

                {car.seats && (
                  <div className="bg-card rounded-lg p-4 flex items-center gap-3 border border-border">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Seats</p>
                      <p className="font-semibold">{car.seats}</p>
                    </div>
                  </div>
                )}

                {car.mileage && (
                  <div className="bg-card rounded-lg p-4 flex items-center gap-3 border border-border">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Gauge className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Distance</p>
                      <p className="font-semibold">{car.mileage}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Car Equipment */}
            <div>
              <h2 className="font-heading text-xl font-bold mb-4">Car Equipment</h2>
              <div className="grid grid-cols-2 gap-3">
                {carEquipment.map((equipment, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{equipment}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  // Add car to compare list
                  const stored = localStorage.getItem("compareCars");
                  const compareCars: number[] = stored ? JSON.parse(stored) : [];
                  
                  if (!compareCars.includes(car.id)) {
                    if (compareCars.length < 4) {
                      compareCars.push(car.id);
                      localStorage.setItem("compareCars", JSON.stringify(compareCars));
                    } else {
                      alert("You can compare up to 4 cars at a time. Please remove a car from comparison first.");
                      return;
                    }
                  }
                  
                  // If there are other cars selected, go to compare page
                  // Otherwise, go to vehicles page to select more cars
                  if (compareCars.length >= 2) {
                    navigate("/compare", { state: { carIds: compareCars } });
                  } else {
                    navigate("/vehicles");
                  }
                }}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-6 text-lg"
              >
                Compare car
              </Button>
              <Button
                onClick={() => navigate(`/rent/${car.id}`)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
              >
                Rent a car
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Cars Section */}
        <div className="mt-16">
          <h2 className="font-heading text-3xl font-bold mb-8">Similar Cars</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cars
              .filter((c) => c.id !== car.id && (c.brand === car.brand || c.type === car.type))
              .slice(0, 3)
              .map((similarCar) => (
                <div
                  key={similarCar.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="bg-gradient-to-br from-card-dark to-card-dark/80 p-8 h-40 flex items-center justify-center">
                    <CarIcon className="w-24 h-24 text-muted-foreground/30" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-xl font-bold mb-2">
                      {similarCar.brand} {similarCar.type}
                    </h3>
                    <p className="text-primary font-bold text-xl mb-4">
                      ${similarCar.price} <span className="text-sm text-muted-foreground">per day</span>
                    </p>
                    <Button
                      type="button"
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                      onClick={() => {
                        navigate(`/vehicles/${similarCar.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CarDetails;

