import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Settings, Fuel, Wind, Users, Gauge, ArrowLeft, Car as CarIcon, ChevronRight, Check, Loader2, Building2, MapPin } from "lucide-react";
import { enduserCarsApi, type EndUserCar } from "@/services/enduserCarsApi";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

interface CarWithDetails extends EndUserCar {
  tenantName?: string;
  locationName?: string;
  locationCity?: string;
}

const CarDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [car, setCar] = useState<CarWithDetails | null>(null);
  const [similarCars, setSimilarCars] = useState<EndUserCar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isLoadingUnavailableDates, setIsLoadingUnavailableDates] = useState(false);

  // Fetch tenant and location info for a car
  const enrichCarWithDetails = async (carData: EndUserCar): Promise<CarWithDetails> => {
    try {
      // Get tenant info
      const tenant = await enduserCarsApi.getTenantById(carData.tenant_id);
      
      // Get location info
      let location = null;
      if (carData.location_id) {
        location = await enduserCarsApi.getLocationById(carData.location_id, carData.tenant_id);
      }

      return {
        ...carData,
        tenantName: tenant?.name,
        locationName: location?.name,
        locationCity: location?.city,
      };
    } catch (error) {
      console.error('Error enriching car with details:', error);
      return { ...carData };
    }
  };

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const carData = await enduserCarsApi.getCarById(id);
        if (carData) {
          // Enrich car with tenant and location details
          const enrichedCar = await enrichCarWithDetails(carData);
          setCar(enrichedCar);
          
          // Fetch similar cars (same make or category)
          const similar = await enduserCarsApi.searchCars({
            status: 'available',
            brand: carData.make,
          });
          setSimilarCars(similar.filter(c => c.id !== carData.id).slice(0, 3));
        } else {
          toast({
            title: "Error",
            description: "Car not found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching car:', error);
        toast({
          title: "Error",
          description: "Failed to load car details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCar();
  }, [id, toast]);

  // Fetch unavailable dates when car is loaded
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      if (!id || !car) return;

      setIsLoadingUnavailableDates(true);
      try {
        const reservations = await enduserCarsApi.getUnavailableDates(id);
        
        // Convert reservation date ranges to individual dates
        const dates: Date[] = [];
        reservations.forEach((reservation) => {
          const startDate = new Date(reservation.start_date);
          const endDate = new Date(reservation.end_date);
          
          // Add all dates in the range (inclusive)
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

  // Car equipment from features array
  const carEquipment = car.features || [];

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
              <span className={`px-4 py-1 rounded text-sm font-semibold ${
                car.status === 'available' 
                  ? 'bg-green-500 text-white' 
                  : car.status === 'rented'
                  ? 'bg-red-500 text-white'
                  : 'bg-yellow-500 text-white'
              }`}>
                {car.status === 'available' ? 'Available' : car.status === 'rented' ? 'Rented' : 'Maintenance'}
              </span>
            </div>

            {/* Car Name and Price */}
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">
                {car.make} {car.model}
              </h1>
              <p className="text-3xl text-primary font-bold mb-4">
                ${car.price_per_day} <span className="text-lg text-muted-foreground">/ day</span>
              </p>
              
              {/* Tenant and Location Info */}
              <div className="mb-6 space-y-2">
                {car.tenantName && (
                  <div 
                    className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/enduser/tenant/${car.tenant_id}`)}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm font-medium">{car.tenantName}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
                {(car.locationName || car.locationCity) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm">
                      {car.locationName || car.locationCity}
                      {car.locationName && car.locationCity ? `, ${car.locationCity}` : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Car Image - Full Width */}
            <div className="w-full h-96 relative overflow-hidden bg-gradient-to-br from-card-dark to-card-dark/80 rounded-2xl">
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
              <CarIcon className={`w-64 h-64 text-muted-foreground/30 absolute inset-0 m-auto ${car.primary_image_url ? "hidden" : ""}`} />
            </div>
            
            {/* Thumbnail Images */}
            {car.gallery_urls && car.gallery_urls.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {car.gallery_urls.slice(0, 3).map((url, i) => (
                  <div
                    key={i}
                    className="bg-card-dark rounded-lg p-4 h-24 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`${car.make} ${car.model} ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.stopPropagation();
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Availability Section with Calendar */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-bold flex items-center gap-2">
                  Availability
                  <ChevronRight className="w-5 h-5" />
                </h2>
              </div>
              {isLoadingUnavailableDates ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading availability...</span>
                </div>
              ) : (
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
                  className="rounded-md border-0"
                />
              )}
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
                    <p className="font-semibold">{car.fuel_type}</p>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4 flex items-center gap-3 border border-border">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CarIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-semibold">{car.category}</p>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4 flex items-center gap-3 border border-border">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wind className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Air Conditioner</p>
                    <p className="font-semibold">{car.features?.includes("AC") ? "Yes" : "No"}</p>
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

                <div className="bg-card rounded-lg p-4 flex items-center gap-3 border border-border">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Gauge className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-semibold">{car.year}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Car Equipment */}
            {carEquipment.length > 0 && (
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
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  // Add car to compare list
                  const stored = localStorage.getItem("compareCars");
                  const compareCars: string[] = stored ? JSON.parse(stored) : [];
                  
                  if (!compareCars.includes(car.id)) {
                    if (compareCars.length < 4) {
                      compareCars.push(car.id);
                      localStorage.setItem("compareCars", JSON.stringify(compareCars));
                    } else {
                      toast({
                        title: "Limit Reached",
                        description: "You can compare up to 4 cars at a time. Please remove a car from comparison first.",
                        variant: "destructive",
                      });
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
                disabled={car.status !== 'available'}
              >
                Rent a car
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Cars Section */}
        {similarCars.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading text-3xl font-bold mb-8">Similar Cars</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarCars.map((similarCar) => (
                <div
                  key={similarCar.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-full h-40 relative overflow-hidden bg-gradient-to-br from-card-dark to-card-dark/80">
                    {similarCar.primary_image_url ? (
                      <img
                        src={similarCar.primary_image_url}
                        alt={`${similarCar.make} ${similarCar.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.stopPropagation();
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <CarIcon className="w-24 h-24 text-muted-foreground/30 absolute inset-0 m-auto" />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-xl font-bold mb-2">
                      {similarCar.make} {similarCar.model} {similarCar.year ? `(${similarCar.year})` : ""}
                    </h3>
                    <p className="text-primary font-bold text-xl mb-4">
                      ${similarCar.price_per_day} <span className="text-sm text-muted-foreground">per day</span>
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
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CarDetails;
