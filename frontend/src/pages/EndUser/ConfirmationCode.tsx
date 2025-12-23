import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Car as CarIcon, Heart, Settings, Fuel, Wind } from "lucide-react";
import { cars } from "@/data/cars";

const ConfirmationCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state as {
    carId: number;
    pickupDate: Date;
    returnDate: Date;
    pickupTime: string;
    returnTime: string;
    totalPrice: number;
    cardNumber: string;
  } | null;

  const [code, setCode] = useState("");
  const [phoneNumber] = useState("+1 234 567 8900"); // Mock phone number

  const car = bookingData ? cars.find((c) => c.id === bookingData.carId) : null;

  if (!bookingData || !car) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold mb-4">Booking Data Not Found</h1>
            <Button onClick={() => navigate("/vehicles")} className="bg-primary hover:bg-primary/90">
              Back to Vehicles
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      setCode(value);
    }
  };

  const handleResendCode = () => {
    // In a real app, this would resend the code
    alert("Confirmation code resent!");
  };

  const handleContinue = () => {
    if (code.length === 4) {
      navigate("/rent/confirmation", {
        state: bookingData,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/rent/payment", { state: bookingData })}
          className="mb-8 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Car Details */}
          <div>
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

          {/* Right Column - Confirmation Code */}
          <div>
            <h2 className="font-heading text-2xl font-bold mb-4">
              A confirmation code was sent to your phone:
            </h2>
            <p className="text-muted-foreground mb-6">{phoneNumber}</p>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Enter code :</label>
              <Input
                type="text"
                placeholder="0000"
                value={code}
                onChange={handleCodeChange}
                maxLength={4}
                className="w-full text-center text-2xl tracking-widest"
              />
            </div>

            <Button
              variant="outline"
              onClick={handleResendCode}
              className="w-full mb-6"
            >
              Resend code
            </Button>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/rent/payment", { state: bookingData })}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleContinue}
                disabled={code.length !== 4}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
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

export default ConfirmationCode;

