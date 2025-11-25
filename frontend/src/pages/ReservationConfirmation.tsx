import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, ArrowLeft } from "lucide-react";
import { cars } from "@/data/cars";
import { format } from "date-fns";

const ReservationConfirmation = () => {
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

  const car = bookingData ? cars.find((c) => c.id === bookingData.carId) : null;
  const reservationId = `#RES-${Math.floor(Math.random() * 100000)}`;

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

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF
    alert("Receipt download functionality would be implemented here");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Column - Car Details */}
          <div>
            <div className="bg-card rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-br from-card-dark to-card-dark/80 p-8 h-48 flex items-center justify-center">
                <div className="w-32 h-32 bg-muted/30 rounded-lg"></div>
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
              </div>
            </div>
          </div>

          {/* Right Column - Confirmation */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <h1 className="font-heading text-3xl font-bold">Your reservation has been confirmed.</h1>
            </div>

            <p className="text-muted-foreground mb-6">
              Your car rental booking has been successfully completed. Below are the details of your reservation:
            </p>

            <div className="bg-card rounded-lg p-6 mb-6 border border-border">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">Car:</span>
                  <span>{car.brand} {car.type} {car.year || ""}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">Pickup Date & Time:</span>
                  <span>
                    {format(new Date(bookingData.pickupDate), "dd MMMM yyyy")} – {bookingData.pickupTime} {parseInt(bookingData.pickupTime.split(":")[0]) >= 12 ? "PM" : "AM"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">Return Date & Time:</span>
                  <span>
                    {format(new Date(bookingData.returnDate), "dd MMMM yyyy")} – {bookingData.returnTime} {parseInt(bookingData.returnTime.split(":")[0]) >= 12 ? "PM" : "AM"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">Pickup Location:</span>
                  <span>Downtown Branch - Main Street</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">Rental Price:</span>
                  <span>${bookingData.totalPrice.toFixed(2)}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">Reservation ID:</span>
                  <span>{reservationId}</span>
                </li>
              </ul>
            </div>

            <p className="text-muted-foreground mb-6">
              A confirmation email has been sent to your inbox. Thank you for choosing RentoGo!
            </p>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/vehicles")}
                className="flex-1"
              >
                Explore other cars
              </Button>
              <Button
                onClick={handleDownloadReceipt}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Download className="w-4 h-4 mr-2" />
                Download receipt
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReservationConfirmation;

