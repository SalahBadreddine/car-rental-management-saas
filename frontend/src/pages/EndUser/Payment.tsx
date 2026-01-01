import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Car as CarIcon, Heart, Settings, Fuel, Wind, Loader2 } from "lucide-react";
import { enduserReservationsApi } from "@/services/enduserReservationsApi";
import { type EndUserCar } from "@/services/enduserCarsApi";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTenantOptional } from "@/contexts/TenantContext";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const tenantContext = useTenantOptional();
  const tenantSlug = tenantContext?.tenantSlug || '';
  const basePath = tenantSlug ? `/${tenantSlug}` : '';
  
  const bookingData = location.state as {
    carId: string;
    car?: EndUserCar;
    pickupDate: string; // ISO string
    returnDate: string; // ISO string
    pickupTime: string;
    returnTime: string;
    totalPrice: number;
  } | null;

  const [cardNumber, setCardNumber] = useState("");
  const [cvc, setCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate advance payment (15% of total)
  const advancePaymentPercentage = 15;
  const advancePayment = bookingData ? Math.round((bookingData.totalPrice * advancePaymentPercentage) / 100) : 0;
  const remainingPayment = bookingData ? bookingData.totalPrice - advancePayment : 0;

  const car = bookingData?.car;

  if (!bookingData || !car) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold mb-4">Booking Data Not Found</h1>
            <Button onClick={() => navigate(`${basePath}/vehicles`)} className="bg-primary hover:bg-primary/90">
              Back to Vehicles
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-8">Please sign in to complete your reservation.</p>
            <Button onClick={() => navigate("/signin")} className="bg-primary hover:bg-primary/90">
              Sign In
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

  const handleConfirm = async () => {
    if (cardNumber.replace(/\s/g, "").length !== 16 || cvc.length !== 3) {
      toast({
        title: "Invalid Card",
        description: "Please enter a valid card number and CVC.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create reservation
      const reservation = await enduserReservationsApi.create({
        carId: bookingData.carId,
        startDate: bookingData.pickupDate,
        endDate: bookingData.returnDate,
        totalPrice: bookingData.totalPrice,
      });

      toast({
        title: "Reservation Created",
        description: "Your reservation has been successfully created.",
      });

      // Navigate to confirmation
      navigate(`${basePath}/confirm-code`, {
        state: {
          reservationId: reservation.id,
          reservation: reservation,
          car: car,
          pickupDate: bookingData.pickupDate,
          returnDate: bookingData.returnDate,
          pickupTime: bookingData.pickupTime,
          returnTime: bookingData.returnTime,
          totalPrice: bookingData.totalPrice,
          advancePayment,
          remainingPayment,
          cardNumber: cardNumber.replace(/\s/g, ""),
        },
      });
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Reservation Failed",
        description: error?.message || "Failed to create reservation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(`${basePath}/rent/${car.id}`)}
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
              
              <div className="bg-gradient-to-br from-card-dark to-card-dark/80 p-8 h-48 flex items-center justify-center relative overflow-hidden">
                {car.primary_image_url ? (
                  <img
                    src={car.primary_image_url}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <CarIcon className={`w-32 h-32 text-muted-foreground/30 ${car.primary_image_url ? "hidden" : ""}`} />
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold">{car.make}</h3>
                    <p className="text-muted-foreground text-sm">{car.model} {car.year ? `(${car.year})` : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold text-xl">{car.price_per_day} DZD</p>
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
                    <span>{car.fuel_type}</span>
                  </div>
                  {car.features?.includes("AC") && (
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
              <p className="text-sm font-semibold">${advancePayment} ({advancePaymentPercentage}%) payment in advance is required.</p>
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
                  disabled={isProcessing}
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
                  disabled={isProcessing}
                />
              </div>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={cardNumber.replace(/\s/g, "").length !== 16 || cvc.length !== 3 || isProcessing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg mb-6"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm operation"
              )}
            </Button>

            <div className="flex items-center gap-4 mb-6">
              <p className="text-sm text-muted-foreground">
                you will have to pay hand-by-hand an amount of :
              </p>
              <div className="bg-muted rounded-lg px-4 py-2">
                <p className="font-bold">${remainingPayment.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`${basePath}/rent/${car.id}`)}
                className="flex-1"
                disabled={isProcessing}
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={cardNumber.replace(/\s/g, "").length !== 16 || cvc.length !== 3 || isProcessing}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "continue"
                )}
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
