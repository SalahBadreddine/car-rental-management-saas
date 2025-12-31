import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { enduserCarsApi, type EndUserCar } from "@/services/enduserCarsApi";
import { enduserReservationsApi } from "@/services/enduserReservationsApi";
import { ArrowLeft, Car as CarIcon, Fuel, Heart, Loader2, Settings, Wind, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTenantOptional } from "@/contexts/TenantContext";

const RentCar = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const tenantContext = useTenantOptional();
  const tenantSlug = tenantContext?.tenantSlug || '';
  const basePath = tenantSlug ? `/${tenantSlug}` : '';
  
  const [car, setCar] = useState<EndUserCar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<{ from?: Date; to?: Date }>({});
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("17:00");
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isLoadingUnavailableDates, setIsLoadingUnavailableDates] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) {
        console.error('RentCar: No car ID provided');
        toast({
          title: "Error",
          description: "Car ID is missing.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log('RentCar: Fetching car with ID:', id);
      setIsLoading(true);
      try {
        const carData = await enduserCarsApi.getCarById(id);
        console.log('RentCar: Car data received:', carData);
        if (carData) {
          setCar(carData);
        } else {
          console.error('RentCar: Car data is null');
          toast({
            title: "Error",
            description: "Car not found. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('RentCar: Error fetching car:', error);
        toast({
          title: "Error",
          description: error?.message || "Failed to load car details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCar();
  }, [id, toast]);


  useEffect(() => {
    const fetchUnavailableDates = async () => {
      if (!id || !car) return;

      setIsLoadingUnavailableDates(true);
      try {
        const reservations = await enduserCarsApi.getUnavailableDates(id);
        

        const dates: Date[] = [];
        reservations.forEach((reservation) => {
          const startDate = new Date(reservation.start_date);
          const endDate = new Date(reservation.end_date);
          

          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });

        setUnavailableDates(dates);
      } catch (error) {
        console.error('Error fetching unavailable dates:', error);
      } finally {
        setIsLoadingUnavailableDates(false);
      }
    };

    fetchUnavailableDates();
  }, [id, car]);

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

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold mb-4">Car Not Found</h1>
            <Button onClick={() => navigate(`${basePath}/vehicles`)} className="bg-primary hover:bg-primary/90">
              Back to Vehicles
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }


  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-heading text-3xl font-bold mb-4">Login Required</h1>
            <p className="text-muted-foreground mb-8">
              You need to be logged in to rent a car. Please sign in or create an account to continue.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate('/signin', { state: { returnTo: `${basePath}/rent/${id}` } })}
                className="bg-primary hover:bg-primary/90 text-white px-8"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/signup', { state: { returnTo: `${basePath}/rent/${id}` } })}
              >
                Create Account
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate(`${basePath}/vehicles/${id}`)}
              className="mt-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Car Details
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
    return days * car.price_per_day;
  };

  const totalPrice = calculateTotalPrice();

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return [`${hour}:00`, `${hour}:30`];
  }).flat();

  const handleContinue = async () => {

    if (isCreatingReservation) return;

    if (!selectedDates.from || !selectedDates.to) {
      toast({
        title: "Missing Information",
        description: "Please select pickup and return dates.",
        variant: "destructive",
      });
      return;
    }

    if (!car) {
      toast({
        title: "Error",
        description: "Car information is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }


    const pickupDate = new Date(selectedDates.from);
    const [pickupHour, pickupMinute] = pickupTime.split(":").map(Number);
    pickupDate.setHours(pickupHour, pickupMinute, 0, 0);

    const returnDate = new Date(selectedDates.to);
    const [returnHour, returnMinute] = returnTime.split(":").map(Number);
    returnDate.setHours(returnHour, returnMinute, 0, 0);


    const selectedDateRange: Date[] = [];
    const currentDate = new Date(pickupDate);
    while (currentDate <= returnDate) {
      selectedDateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const hasOverlap = selectedDateRange.some((selectedDate) => {
      return unavailableDates.some((unavailableDate) => {
        const unavailable = new Date(unavailableDate);
        unavailable.setHours(0, 0, 0, 0);
        const checkDate = new Date(selectedDate);
        checkDate.setHours(0, 0, 0, 0);
        return unavailable.getTime() === checkDate.getTime();
      });
    });

    if (hasOverlap) {
      toast({
        title: "Not Available",
        description: "This car is not available for the selected dates. Please choose different dates.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingReservation(true);

    try {
      const totalPrice = calculateTotalPrice();


      console.log('Creating reservation with data:', {
        carId: car.id,
        startDate: pickupDate.toISOString(),
        endDate: returnDate.toISOString(),
        totalPrice: totalPrice,
      });

      const reservation = await enduserReservationsApi.create({
        carId: car.id,
        startDate: pickupDate.toISOString(),
        endDate: returnDate.toISOString(),
        totalPrice: totalPrice,
      });

      console.log('Reservation created successfully:', reservation);

      if (reservation) {
        toast({
          title: "Reservation Created",
          description: "Your reservation has been successfully created!",
        });

        // Navigate to confirmation page
        navigate(`${basePath}/confirmation`, {
          state: {
            reservationId: reservation.id || reservation.confirmation_code || `RES-${Date.now()}`,
            reservation: reservation,
            car: car,
            pickupDate: pickupDate.toISOString(),
            returnDate: returnDate.toISOString(),
            pickupTime,
            returnTime,
            totalPrice: totalPrice,
          },
        });
      } else {
        throw new Error("Failed to create reservation - no data returned");
      }
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create reservation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingReservation(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(`${basePath}/vehicles/${car.id}`)}
          className="mb-8 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          <div>
            <h1 className="font-heading text-3xl font-bold mb-6">Rent this car</h1>
            
            <div className="bg-card rounded-2xl overflow-hidden shadow-lg relative">
              <button className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-md">
                <Heart className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <div className="w-full h-48 relative overflow-hidden bg-gradient-to-br from-card-dark to-card-dark/80">
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
                    onLoad={(e) => {
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.add("hidden");
                    }}
                  />
                ) : null}
                <CarIcon className={`w-32 h-32 text-muted-foreground/30 absolute inset-0 m-auto ${car.primary_image_url ? "hidden" : ""}`} />
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
                  onClick={() => navigate(`${basePath}/vehicles/${car.id}`)}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg h-11"
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>


          <div>
            <h2 className="font-heading text-2xl font-bold mb-6">Select rental duration :</h2>
            

            <div className="bg-card rounded-lg p-6 mb-6 border border-border">
              {isLoadingUnavailableDates ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading availability...</span>
                </div>
              ) : (
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
                  disabled={(date) => {
                    // Disable past dates
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (date < today) return true;

                    // Disable unavailable dates
                    return unavailableDates.some((unavailableDate) => {
                      const unavailable = new Date(unavailableDate);
                      unavailable.setHours(0, 0, 0, 0);
                      const checkDate = new Date(date);
                      checkDate.setHours(0, 0, 0, 0);
                      return unavailable.getTime() === checkDate.getTime();
                    });
                  }}
                />
              )}
            </div>


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


            <div className="bg-card rounded-lg p-6 mb-6 border border-border">
              <h3 className="font-heading text-xl font-bold mb-4">Total Price</h3>
              <p className="text-muted-foreground mb-4">
                Your total price for this rental is :
              </p>
              <div className="bg-muted rounded-lg p-4 mb-4">
                <p className="text-3xl font-bold text-primary">{totalPrice || car.price_per_day} DZD</p>
              </div>
              <Button
                onClick={handleContinue}
                disabled={!selectedDates.from || !selectedDates.to || isCreatingReservation || car.status !== 'available' || isLoadingUnavailableDates}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
              >
                {isCreatingReservation ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Reservation...
                  </>
                ) : (
                  "Continue"
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

export default RentCar;
