import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car as CarIcon, Calendar, Clock, DollarSign, Building2, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { enduserReservationsApi } from "@/services/enduserReservationsApi";
import { enduserCarsApi } from "@/services/enduserCarsApi";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

interface Reservation {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  confirmation_code?: string;
  created_at: string;
  tenant_id?: string;
  car?: {
    id: string;
    make: string;
    model: string;
    year?: number;
    primary_image_url?: string;
    price_per_day: number;
  };
  tenant?: {
    id: string;
    name: string;
    contact_email?: string;
    phone_number?: string;
  };
}

const ReservationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await enduserReservationsApi.getById(id);
        

        let carData = data.cars || data.car;
        if (!carData && data.car_id) {
          carData = await enduserCarsApi.getCarById(data.car_id);
        }


        let tenantData = null;
        if (data.tenant_id) {
          tenantData = await enduserCarsApi.getTenantById(data.tenant_id);
        }

        setReservation({
          ...data,
          car: carData ? {
            id: carData.id || data.car_id,
            make: carData.make,
            model: carData.model,
            year: carData.year,
            primary_image_url: carData.primary_image_url,
            price_per_day: carData.price_per_day,
          } : undefined,
          tenant: tenantData ? {
            id: tenantData.id,
            name: tenantData.name,
            contact_email: tenantData.contact_email,
            phone_number: tenantData.phone_number,
          } : undefined,
        });
      } catch (error: any) {
        console.error('Error fetching reservation:', error);
        toast({
          title: "Error",
          description: error?.message || "Failed to load reservation details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservation();
  }, [id, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'confirmed':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'active':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'completed':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleDownloadReceipt = () => {
    if (!reservation || !reservation.car) return;

    const reservationCode = reservation.confirmation_code || reservation.id.slice(0, 8);
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
            <p>Date: ${format(new Date(reservation.created_at), "MMMM dd, yyyy 'at' hh:mm a")}</p>
          </div>

          <div class="section">
            <h2>Reservation Details</h2>
            <div class="info-row">
              <span class="info-label">Reservation ID:</span>
              <span class="info-value">${reservationCode}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value">${getStatusText(reservation.status)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Pickup Date:</span>
              <span class="info-value">${format(new Date(reservation.start_date), "MMMM dd, yyyy 'at' hh:mm a")}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Return Date:</span>
              <span class="info-value">${format(new Date(reservation.end_date), "MMMM dd, yyyy 'at' hh:mm a")}</span>
            </div>
          </div>

          <div class="section">
            <h2>Vehicle Information</h2>
            <div class="info-row">
              <span class="info-label">Vehicle:</span>
              <span class="info-value">${reservation.car.make} ${reservation.car.model} ${reservation.car.year ? `(${reservation.car.year})` : ""}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Price per Day:</span>
              <span class="info-value">${reservation.car.price_per_day.toFixed(2)} DZD</span>
            </div>
          </div>

          <div class="section">
            <h2>Pricing</h2>
            <div class="total">
              <div class="info-row">
                <span class="info-label">Total Amount:</span>
                <span class="amount">${reservation.total_price.toFixed(2)} DZD</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This is a confirmation receipt for your car rental reservation.</p>
            <p>Thank you for choosing our car rental service!</p>
          </div>
        </body>
      </html>
    `;

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold mb-4">Reservation Not Found</h1>
            <Button onClick={() => navigate("/profile")} className="bg-primary hover:bg-primary/90">
              Back to Profile
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const days = Math.ceil((new Date(reservation.end_date).getTime() - new Date(reservation.start_date).getTime()) / (1000 * 60 * 60 * 24));
  const reservationCode = reservation.confirmation_code || reservation.id.slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">

        <Button
          variant="ghost"
          onClick={() => navigate("/profile")}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Reservations
        </Button>


        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Reservation Details</h1>
            <p className="text-muted-foreground">Reservation Code: <span className="font-mono font-semibold">{reservationCode}</span></p>
          </div>
          <div className={`px-4 py-2 rounded-lg border font-medium ${getStatusBadge(reservation.status)}`}>
            {getStatusText(reservation.status)}
          </div>
        </div>


        <div className="bg-card rounded-lg border border-border shadow-sm mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div>
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CarIcon className="w-5 h-5 text-primary" />
                  Vehicle Information
                </h2>
                {reservation.car && (
                  <>
                    <div className="w-full h-48 bg-muted rounded-lg overflow-hidden mb-4">
                      {reservation.car.primary_image_url ? (
                        <img
                          src={reservation.car.primary_image_url}
                          alt={`${reservation.car.make} ${reservation.car.model}`}
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
                    <h3 className="font-bold text-xl">{reservation.car.make} {reservation.car.model}</h3>
                    {reservation.car.year && <p className="text-muted-foreground">{reservation.car.year}</p>}
                    <p className="text-lg font-semibold text-primary mt-2">{reservation.car.price_per_day} DZD/day</p>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/vehicles/${reservation.car_id}`)}
                      className="mt-4 w-full"
                    >
                      View Car Details
                    </Button>
                  </>
                )}
              </div>


              <div>
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Reservation Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pickup Date & Time</p>
                    <p className="font-semibold">{format(new Date(reservation.start_date), "MMM dd, yyyy")}</p>
                    <p className="text-muted-foreground">{format(new Date(reservation.start_date), "hh:mm a")}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Return Date & Time</p>
                    <p className="font-semibold">{format(new Date(reservation.end_date), "MMM dd, yyyy")}</p>
                    <p className="text-muted-foreground">{format(new Date(reservation.end_date), "hh:mm a")}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="font-semibold">{days} {days === 1 ? 'day' : 'days'}</p>
                  </div>

                  {reservation.tenant && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">Rental Agency</p>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-semibold">{reservation.tenant.name}</p>
                          {reservation.tenant.phone_number && (
                            <p className="text-sm text-muted-foreground">{reservation.tenant.phone_number}</p>
                          )}
                          {reservation.tenant.contact_email && (
                            <p className="text-sm text-muted-foreground">{reservation.tenant.contact_email}</p>
                          )}
                        </div>
                      </div>
                      {reservation.tenant_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/enduser/tenant/${reservation.tenant_id}`)}
                          className="mt-2"
                        >
                          View Agency Details
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-primary">{reservation.total_price.toFixed(2)} DZD</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reservation Date</p>
                    <p className="font-semibold">{format(new Date(reservation.created_at), "MMM dd, yyyy 'at' hh:mm a")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {reservation.status === 'pending' && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Pending Approval:</strong> Your reservation is waiting for approval from the rental agency. You will be notified once your reservation is approved or rejected.
            </p>
          </div>
        )}

        {reservation.status === 'confirmed' && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Confirmed:</strong> Your reservation has been confirmed! Please arrive on time for your pickup appointment.
            </p>
          </div>
        )}

        {reservation.status === 'cancelled' && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Cancelled:</strong> This reservation has been cancelled.
            </p>
          </div>
        )}


        <div className="flex flex-col sm:flex-row gap-4">
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
            onClick={() => navigate("/profile")}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            Back to My Reservations
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReservationDetails;
