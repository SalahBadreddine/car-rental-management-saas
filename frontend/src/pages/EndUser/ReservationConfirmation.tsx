import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, ArrowLeft, Car as CarIcon, Calendar, Clock, DollarSign, FileText, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { type EndUserCar } from "@/services/enduserCarsApi";

const ReservationConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const confirmationData = location.state as {
    reservationId: string;
    reservation?: any;
    car?: EndUserCar;
    pickupDate: string;
    returnDate: string;
    pickupTime: string;
    returnTime: string;
    totalPrice: number;
    advancePayment?: number;
    remainingPayment?: number;
  } | null;

  if (!confirmationData || !confirmationData.car) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
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

  const { car, reservationId, reservation, pickupDate, returnDate, pickupTime, returnTime, totalPrice } = confirmationData;
  const reservationCode = reservation?.confirmation_code || reservationId || `#RES-${Math.floor(Math.random() * 100000)}`;

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF
    alert("Receipt download functionality would be implemented here. This would generate a PDF with reservation details.");
  };

  const handleViewProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Success Animation Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-6 shadow-2xl">
              <CheckCircle2 className="w-20 h-20 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-bounce" />
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Reservation Confirmed!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your car rental booking has been successfully completed. We've sent a confirmation email to your inbox.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Car Details Card */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-3xl overflow-hidden shadow-2xl border-2 border-primary/20 hover:border-primary/40 transition-all">
              <div className="w-full h-64 relative overflow-hidden bg-gradient-to-br from-card-dark to-card-dark/80">
                {car.primary_image_url ? (
                  <img
                    src={car.primary_image_url}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.stopPropagation();
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <CarIcon className={`w-32 h-32 text-muted-foreground/30 absolute inset-0 m-auto ${car.primary_image_url ? "hidden" : ""}`} />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-2xl font-bold">{car.make} {car.model}</h3>
                    <p className="text-muted-foreground text-sm">{car.year ? `(${car.year})` : ""} • {car.category}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Price per day</p>
                    <p className="text-2xl font-bold text-primary">${car.price_per_day}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Reservation Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reservation ID Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="font-heading text-2xl font-bold">Reservation ID</h2>
              </div>
              <p className="text-3xl font-mono font-bold text-primary">{reservationCode}</p>
              <p className="text-sm text-muted-foreground mt-2">Keep this ID for your records</p>
            </div>

            {/* Details Card */}
            <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Reservation Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CarIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Vehicle</p>
                      <p className="font-semibold text-lg">{car.make} {car.model} {car.year ? `(${car.year})` : ""}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Pickup Date & Time</p>
                      <p className="font-semibold text-lg">
                        {format(new Date(pickupDate), "EEEE, MMMM dd, yyyy")}
                      </p>
                      <p className="text-muted-foreground">
                        {pickupTime} {parseInt(pickupTime.split(":")[0]) >= 12 ? "PM" : "AM"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Return Date & Time</p>
                      <p className="font-semibold text-lg">
                        {format(new Date(returnDate), "EEEE, MMMM dd, yyyy")}
                      </p>
                      <p className="text-muted-foreground">
                        {returnTime} {parseInt(returnTime.split(":")[0]) >= 12 ? "PM" : "AM"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Price</p>
                      <p className="font-semibold text-3xl text-primary">${totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleViewProfile}
                className="flex-1 h-12 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                View My Reservations
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/vehicles")}
                className="flex-1 h-12 text-lg"
                size="lg"
              >
                Explore More Cars
              </Button>
              <Button
                onClick={handleDownloadReceipt}
                variant="outline"
                className="flex-1 h-12 text-lg"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Receipt
              </Button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>You'll receive a confirmation email shortly with all the details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Please arrive on time for your pickup appointment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Bring a valid driver's license and payment method</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>You can view and manage your reservation in your profile</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReservationConfirmation;
