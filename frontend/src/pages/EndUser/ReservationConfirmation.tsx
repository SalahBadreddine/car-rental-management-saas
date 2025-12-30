import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, ArrowLeft, Car as CarIcon, Calendar, Clock, DollarSign, FileText } from "lucide-react";
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
  const reservationCode = reservation?.confirmation_code || reservationId || `RES-${Date.now().toString().slice(-8)}`;

  const handleDownloadReceipt = () => {
    // Generate receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Reservation Receipt - ${reservationCode}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #D32F2F;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #D32F2F;
              margin: 0;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              color: #333;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .info-value {
              color: #333;
            }
            .total {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin-top: 20px;
            }
            .total .amount {
              font-size: 24px;
              font-weight: bold;
              color: #D32F2F;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Car Rental Reservation Receipt</h1>
            <p>Confirmation Code: <strong>${reservationCode}</strong></p>
            <p>Date: ${format(new Date(), "MMMM dd, yyyy 'at' hh:mm a")}</p>
          </div>

          <div class="section">
            <h2>Reservation Details</h2>
            <div class="info-row">
              <span class="info-label">Reservation ID:</span>
              <span class="info-value">${reservationCode}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value">Pending Approval</span>
            </div>
            <div class="info-row">
              <span class="info-label">Pickup Date:</span>
              <span class="info-value">${format(new Date(pickupDate), "MMMM dd, yyyy")} at ${pickupTime} ${parseInt(pickupTime.split(":")[0]) >= 12 ? "PM" : "AM"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Return Date:</span>
              <span class="info-value">${format(new Date(returnDate), "MMMM dd, yyyy")} at ${returnTime} ${parseInt(returnTime.split(":")[0]) >= 12 ? "PM" : "AM"}</span>
            </div>
          </div>

          <div class="section">
            <h2>Vehicle Information</h2>
            <div class="info-row">
              <span class="info-label">Vehicle:</span>
              <span class="info-value">${car.make} ${car.model} ${car.year ? `(${car.year})` : ""}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Category:</span>
              <span class="info-value">${car.category}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Price per Day:</span>
              <span class="info-value">$${car.price_per_day.toFixed(2)}</span>
            </div>
          </div>

          <div class="section">
            <h2>Pricing</h2>
            <div class="total">
              <div class="info-row">
                <span class="info-label">Total Amount:</span>
                <span class="amount">$${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This is a confirmation receipt for your car rental reservation.</p>
            <p>Your reservation is pending approval from the rental agency.</p>
            <p>You will be notified once your reservation is approved or rejected.</p>
            <p>Thank you for choosing our car rental service!</p>
          </div>
        </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reservation-receipt-${reservationCode}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleViewProfile = () => {
    navigate("/profile");
  };

  const days = Math.ceil((new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/vehicles")}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vehicles
        </Button>

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Reservation Confirmed</h1>
          <p className="text-muted-foreground">Your reservation has been submitted successfully</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-card rounded-lg border border-border shadow-sm mb-6">
          {/* Reservation Code Header */}
          <div className="bg-muted/50 border-b border-border px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reservation Code</p>
                <p className="font-mono font-bold text-xl text-primary">{reservationCode}</p>
              </div>
              <div className="px-3 py-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-md text-sm font-medium">
                Pending Approval
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Car Info */}
              <div>
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CarIcon className="w-5 h-5 text-primary" />
                  Vehicle Details
                </h2>
                <div className="mb-4">
                  <div className="w-full h-48 bg-muted rounded-lg overflow-hidden mb-4">
                    {car.primary_image_url ? (
                      <img
                        src={car.primary_image_url}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CarIcon className="w-24 h-24 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-xl">{car.make} {car.model}</h3>
                  {car.year && <p className="text-muted-foreground">{car.year} • {car.category}</p>}
                  <p className="text-lg font-semibold text-primary mt-2">${car.price_per_day}/day</p>
                </div>
              </div>

              {/* Right Column - Reservation Details */}
              <div>
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Reservation Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pickup Date & Time</p>
                    <p className="font-semibold">{format(new Date(pickupDate), "MMM dd, yyyy")}</p>
                    <p className="text-muted-foreground">{pickupTime} {parseInt(pickupTime.split(":")[0]) >= 12 ? "PM" : "AM"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Return Date & Time</p>
                    <p className="font-semibold">{format(new Date(returnDate), "MMM dd, yyyy")}</p>
                    <p className="text-muted-foreground">{returnTime} {parseInt(returnTime.split(":")[0]) >= 12 ? "PM" : "AM"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="font-semibold">{days} {days === 1 ? 'day' : 'days'}</p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-primary">${totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Info Box */}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Your reservation is pending approval from the rental agency. You will be notified via email once your reservation is approved or rejected.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleViewProfile}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            View My Reservations
          </Button>
          <Button
            onClick={handleDownloadReceipt}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/vehicles")}
            className="flex-1"
            size="lg"
          >
            Browse More Cars
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReservationConfirmation;