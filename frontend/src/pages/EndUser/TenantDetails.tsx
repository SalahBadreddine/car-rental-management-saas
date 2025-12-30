import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Phone, Mail, MapPin, Car as CarIcon, Loader2 } from "lucide-react";
import { enduserCarsApi, type EndUserCar } from "@/services/enduserCarsApi";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { CarCard } from "@/components/CarCard";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  contact_email?: string;
  phone_number?: string;
}

const TenantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [cars, setCars] = useState<EndUserCar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Tenant ID is missing.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch tenant details
        const tenantData = await enduserCarsApi.getTenantById(id);
        if (!tenantData) {
          toast({
            title: "Error",
            description: "Tenant not found.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        setTenant(tenantData);

        // Fetch tenant's cars
        const tenantCars = await enduserCarsApi.getCarsFromTenant(id, { status: 'available' });
        setCars(tenantCars);
      } catch (error: any) {
        console.error('Error fetching tenant data:', error);
        toast({
          title: "Error",
          description: error?.message || "Failed to load tenant details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

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

  if (!tenant) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold mb-4">Tenant Not Found</h1>
            <Button onClick={() => navigate("/vehicles")} className="bg-primary hover:bg-primary/90">
              Back to Vehicles
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

        {/* Tenant Information Section */}
        <div className="bg-card rounded-2xl p-8 mb-12 border border-border shadow-lg">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Tenant Logo/Icon */}
            <div className="flex-shrink-0">
              {tenant.logo_url ? (
                <img
                  src={tenant.logo_url}
                  alt={tenant.name}
                  className="w-32 h-32 rounded-lg object-cover border-2 border-border"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-primary/10 flex items-center justify-center border-2 border-border">
                  <Building2 className="w-16 h-16 text-primary" />
                </div>
              )}
            </div>

            {/* Tenant Details */}
            <div className="flex-1">
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">{tenant.name}</h1>
              
              <div className="space-y-4">
                {tenant.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="text-lg">{tenant.contact_email}</span>
                  </div>
                )}
                
                {tenant.phone_number && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <span className="text-lg">{tenant.phone_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Available Cars Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl font-bold">Available Cars</h2>
            <span className="text-muted-foreground">
              {cars.length} {cars.length === 1 ? 'car' : 'cars'} available
            </span>
          </div>

          {cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <div
                  key={car.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => navigate(`/vehicles/${car.id}`)}
                >
                  <div className="w-full h-48 relative overflow-hidden bg-gradient-to-br from-card-dark to-card-dark/80">
                    {car.primary_image_url ? (
                      <img
                        src={car.primary_image_url}
                        alt={`${car.make} ${car.model}`}
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
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-heading text-xl font-bold">{car.make}</h3>
                        <p className="text-muted-foreground text-sm">{car.model} {car.year ? `(${car.year})` : ""}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-primary font-bold text-xl">${car.price_per_day}</p>
                        <p className="text-muted-foreground text-xs">per day</p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/vehicles/${car.id}`);
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-12 text-center border border-border">
              <CarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No available cars from this tenant at the moment.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TenantDetails;
