import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Fuel, Wind, ArrowLeft, Car as CarIcon, Heart } from "lucide-react";
import { cars } from "@/data/cars";
import { Car } from "@/types/car";

const RentCar = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const carId = id ? parseInt(id, 10) : null;
  const car: Car | undefined = carId ? cars.find((c) => c.id === carId) : undefined;

  const [selectedDates, setSelectedDates] = useState<{ from?: Date; to?: Date }>({});
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("17:00");

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold mb-4">Car Not Found</h1>
            <Button onClick={() => navigate("/vehicles")} className="bg-primary hover:bg-primary/90">
              Back to Vehicles
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const calculateTotalPrice = () => {
    if (!selectedDates.from || !selectedDates.to) return 0;
    const days = Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days * car.price;
  };

  const totalPrice = calculateTotalPrice();

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return [`${hour}:00`, `${hour}:30`];
  }).flat();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(`/vehicles/${car.id}`)}
          className="mb-8 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Car Details */}
          <div>
            <h1 className="font-heading text-3xl font-bold mb-6">Rent this car</h1>
            
            <div className="bg-card rounded-2xl overflow-hidden shadow-lg relative">
              <button className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-md">
                <Heart className="w-5 h-5 text-muted-foreground" />
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
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
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
                  onClick={() => navigate(`/vehicles/${car.id}`)}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg h-11"
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Rental Duration Selection */}
          <div>
            <h2 className="font-heading text-2xl font-bold mb-6">Select rental duration :</h2>
            
            {/* Calendar */}
            <div className="bg-card rounded-lg p-6 mb-6 border border-border">
              <Calendar
                mode="range"
                selected={{
                  from: selectedDates.from,
                  to: selectedDates.to,
                }}
                onSelect={(range) => {
                  setSelectedDates({
                    from: range?.from,
                    to: range?.to,
                  });
                }}
                numberOfMonths={1}
                className="rounded-md"
              />
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Pick up time:</label>
                <Select value={pickupTime} onValueChange={setPickupTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time} {parseInt(time.split(":")[0]) >= 12 ? "PM" : "AM"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Return time:</label>
                <Select value={returnTime} onValueChange={setReturnTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time} {parseInt(time.split(":")[0]) >= 12 ? "PM" : "AM"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-card rounded-lg p-6 mb-6 border border-border">
              <h3 className="font-heading text-xl font-bold mb-4">Total Price</h3>
              <p className="text-muted-foreground mb-4">
                Your total price for this rental is :
              </p>
              <div className="bg-muted rounded-lg p-4 mb-4">
                <p className="text-3xl font-bold text-primary">${totalPrice || car.price}</p>
              </div>
              <Button
                onClick={() => {
                  if (selectedDates.from && selectedDates.to) {
                    navigate("/rent/payment", {
                      state: {
                        carId: car.id,
                        pickupDate: selectedDates.from,
                        returnDate: selectedDates.to,
                        pickupTime,
                        returnTime,
                        totalPrice: totalPrice || car.price,
                      },
                    });
                  }
                }}
                disabled={!selectedDates.from || !selectedDates.to}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
              >
                continue
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RentCar;

