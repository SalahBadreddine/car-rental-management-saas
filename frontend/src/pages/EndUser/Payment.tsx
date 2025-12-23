import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Car as CarIcon, Heart, Settings, Fuel, Wind } from "lucide-react";
import { cars } from "@/data/cars";
import { format } from "date-fns";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state as {
    carId: number;
    pickupDate: Date;
    returnDate: Date;
    pickupTime: string;
    returnTime: string;
    totalPrice: number;
  } | null;

  const [cardNumber, setCardNumber] = useState("");
  const [cvc, setCvc] = useState("");
  const [advancePayment] = useState(15);
  const [remainingPayment] = useState(bookingData ? bookingData.totalPrice - 15 : 0);

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

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(" ");
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 3) {
      setCvc(value);
    }
  };

  const handleConfirm = () => {
    if (cardNumber.replace(/\s/g, "").length === 16 && cvc.length === 3) {
      navigate("/rent/confirm-code", {
        state: {
          ...bookingData,
          cardNumber: cardNumber.replace(/\s/g, ""),
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(`/rent/${car.id}`)}
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

          {/* Right Column - Payment Form */}
          <div>
            <h2 className="font-heading text-2xl font-bold mb-6">Payment :</h2>
            
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold">{advancePayment}$ payment in advance is required.</p>
            </div>

            <div className="space-y-6 mb-6">
              <div>
                <Label htmlFor="cardNumber" className="mb-2 block">
                  Enter your card number :
                </Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="cvc" className="mb-2 block">
                  CVC code :
                </Label>
                <Input
                  id="cvc"
                  type="text"
                  placeholder="000"
                  value={cvc}
                  onChange={handleCvcChange}
                  maxLength={3}
                  className="w-full"
                />
              </div>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={cardNumber.replace(/\s/g, "").length !== 16 || cvc.length !== 3}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg mb-6"
            >
              Confirm operation
            </Button>

            <div className="flex items-center gap-4 mb-6">
              <p className="text-sm text-muted-foreground">
                you will have to pay hand-by-hand an amount of :
              </p>
              <div className="bg-muted rounded-lg px-4 py-2">
                <p className="font-bold">${remainingPayment}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/rent/${car.id}`)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={cardNumber.replace(/\s/g, "").length !== 16 || cvc.length !== 3}
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

export default Payment;

