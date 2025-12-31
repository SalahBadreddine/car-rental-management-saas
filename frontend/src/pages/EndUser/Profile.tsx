import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Edit, LogOut, Car as CarIcon, Clock, Calendar, ChevronRight, Loader2, RefreshCw, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { getAccessToken, logout as logoutUser } from "@/lib/auth";
import { enduserReservationsApi } from "@/services/enduserReservationsApi";
import { enduserCarsApi } from "@/services/enduserCarsApi";
import { format } from "date-fns";
import { useTenantOptional } from "@/contexts/TenantContext";

interface User {
  id: string;
  full_name?: string;
  phone_number?: string;
  email?: string;
  address?: string;
}

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
    tenant_id?: string;
  };
  tenant?: {
    id: string;
    name: string;
    slug: string;
    contact_email?: string;
    phone_number?: string;
    logo_url?: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { tenantSlug: currentTenantSlug } = useTenantOptional();
  
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {

      const token = getAccessToken();
      if (!token) {
        toast({
          title: "Error",
          description: "Please sign in to view your profile.",
          variant: "destructive",
        });
        navigate("/signin");
        return;
      }

      const userResponse = await apiRequest('/auth/me', 'GET', undefined, {
        'Authorization': `Bearer ${token}`,
      });

      console.log('Profile - User response:', userResponse);

      if (userResponse.status === 200) {
        setUser(userResponse.data);
      }


      let reservationsData: Reservation[] = [];
      try {
        reservationsData = await enduserReservationsApi.getMyReservations();
        console.log('Profile - Reservations data:', reservationsData);
      } catch (error: any) {
        console.error('Error fetching reservations:', error);
        toast({
          title: "Warning",
          description: error?.message || "Could not load reservations. They may appear after refreshing.",
          variant: "destructive",
        });
      }

      if (!reservationsData || reservationsData.length === 0) {
        console.log('No reservations found');
        setReservations([]);
      } else {

        const enrichedReservations = await Promise.all(
          reservationsData.map(async (reservation: any) => {

            let carData = reservation.cars || reservation.car;
            const tenantId = reservation.tenant_id || carData?.tenant_id;
            

            if (!carData && reservation.car_id) {
              try {
                const car = await enduserCarsApi.getCarById(reservation.car_id);
                carData = car ? {
                  id: car.id,
                  make: car.make,
                  model: car.model,
                  year: car.year,
                  primary_image_url: car.primary_image_url,
                  price_per_day: car.price_per_day,
                  tenant_id: car.tenant_id,
                } : undefined;
              } catch (error) {
                console.error('Error fetching car for reservation:', reservation.car_id, error);
              }
            } else if (carData) {

              carData = {
                id: carData.id || reservation.car_id,
                make: carData.make,
                model: carData.model,
                year: carData.year,
                primary_image_url: carData.primary_image_url,
                price_per_day: carData.price_per_day,
                tenant_id: carData.tenant_id,
              };
            }


            let tenantData = null;
            if (tenantId) {
              try {
                tenantData = await enduserCarsApi.getTenantById(tenantId);
              } catch (error) {
                console.error('Error fetching tenant for reservation:', tenantId, error);
              }
            }

            return {
              ...reservation,
              car: carData,
              tenant: tenantData ? {
                id: tenantData.id,
                name: tenantData.name,
                slug: tenantData.slug,
                contact_email: tenantData.contact_email,
                phone_number: tenantData.phone_number,
                logo_url: tenantData.logo_url,
              } : undefined,
              tenant_id: tenantId,
            };
          })
        );

        console.log('Enriched reservations:', enrichedReservations);
        setReservations(enrichedReservations);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Reservations list has been updated.",
    });
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/signin");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };


  const activeReservations = reservations.filter(r => {
    const endDate = new Date(r.end_date);
    const startDate = new Date(r.start_date);
    const now = new Date();
    return (r.status === 'confirmed' || r.status === 'pending' || r.status === 'active') && 
           startDate <= now && endDate >= now;
  });

  const upcomingReservations = reservations.filter(r => {
    const startDate = new Date(r.start_date);
    return (r.status === 'confirmed' || r.status === 'pending') && startDate > new Date();
  });

  const previousReservations = reservations.filter(r => {
    const endDate = new Date(r.end_date);
    return r.status === 'completed' || r.status === 'cancelled' || 
           ((r.status === 'confirmed' || r.status === 'pending') && endDate < new Date());
  });

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };


  const getNavPath = (path: string, targetTenantSlug?: string) => {
    const slug = targetTenantSlug || currentTenantSlug;
    if (slug) {
      return `/${slug}${path.startsWith('/') ? path : '/' + path}`; 
    }
    // Fallback if no tenant context (should shouldn't happen for these actions usually)
    return path;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">

        <div className="bg-black rounded-2xl p-8 mb-12 relative overflow-hidden">

          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
            }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
                  Personal Information:
                </h1>
                <p className="font-heading text-2xl text-white">{user?.full_name || "User"}</p>
              </div>
              <Link to={getNavPath("/profile/edit")}>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Edit className="w-6 h-6" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4 mb-6">
              {user?.phone_number && (
                <div className="flex items-center gap-3 text-white">
                  <Phone className="w-5 h-5 text-[#D32F2F]" />
                  <span className="text-lg">Phone {user.phone_number}</span>
                </div>
              )}
              {user?.email && (
                <div className="flex items-center gap-3 text-white">
                  <Mail className="w-5 h-5 text-[#D32F2F]" />
                  <span className="text-lg">Email {user.email}</span>
                </div>
              )}
              {user?.address && (
                <div className="flex items-center gap-3 text-white">
                  <MapPin className="w-5 h-5 text-[#D32F2F]" />
                  <span className="text-lg">Address {user.address}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleLogout}
                className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold px-6 py-2 rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                LOG OUT
              </Button>
            </div>
          </div>
        </div>


        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-4xl font-bold">Rented Cars :</h2>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {(activeReservations.length > 0 || upcomingReservations.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeReservations.map((reservation) => {
                const daysLeft = calculateDaysLeft(reservation.end_date);
                return (
                  <div key={reservation.id} className="bg-muted rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 bg-card rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {reservation.car?.primary_image_url ? (
                          <img
                            src={reservation.car.primary_image_url}
                            alt={`${reservation.car.make} ${reservation.car.model}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <CarIcon className="w-12 h-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-heading text-2xl font-bold mb-1">
                              {reservation.car?.make || "Car"} {reservation.car?.model || ""}
                            </h3>
                            <p className="text-muted-foreground">
                              {reservation.car?.year ? `(${reservation.car.year})` : ""}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            reservation.status === 'confirmed' ? 'bg-green-500 text-white' :
                            reservation.status === 'pending' ? 'bg-yellow-500 text-white' :
                            reservation.status === 'active' ? 'bg-blue-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {reservation.status || 'pending'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {daysLeft > 0 ? `${daysLeft} Day${daysLeft !== 1 ? 's' : ''} Left` : 'Due Today'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            Return Date: {format(new Date(reservation.end_date), "dd/MM/yyyy 'at' hh:mm a")}
                          </span>
                        </div>
                        
                        {reservation.tenant && (
                          <div 
                            className="flex items-center gap-2 text-muted-foreground mb-4 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => reservation.tenant?.slug && navigate(`/${reservation.tenant.slug}`)}
                          >
                            <Building2 className="w-4 h-4" />
                            <span className="text-sm">
                              {reservation.tenant.name}
                              {reservation.tenant.phone_number && ` • ${reservation.tenant.phone_number}`}
                            </span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => navigate(getNavPath(`/reservation/${reservation.id}`, reservation.tenant?.slug))}
                            className="flex-1 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold px-4 py-2 rounded-lg"
                          >
                            View Details
                          </Button>
                          <Button 
                            onClick={() => navigate(getNavPath(`/vehicles/${reservation.car_id}`, reservation.tenant?.slug))}
                            variant="outline"
                            className="px-4 py-2 rounded-lg"
                          >
                            Car Info
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="bg-muted rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 bg-card rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {reservation.car?.primary_image_url ? (
                        <img
                          src={reservation.car.primary_image_url}
                          alt={`${reservation.car.make} ${reservation.car.model}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <CarIcon className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-heading text-2xl font-bold mb-1">
                            {reservation.car?.make || "Car"} {reservation.car?.model || ""}
                          </h3>
                          <p className="text-muted-foreground">
                            {reservation.car?.year ? `(${reservation.car.year})` : ""}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          reservation.status === 'confirmed' ? 'bg-green-500 text-white' :
                          reservation.status === 'pending' ? 'bg-yellow-500 text-white' :
                          reservation.status === 'active' ? 'bg-blue-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {reservation.status || 'pending'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          Pick-Up Date: {format(new Date(reservation.start_date), "dd/MM/yyyy 'at' hh:mm a")}
                        </span>
                      </div>
                      
                      {reservation.tenant && (
                        <div 
                          className="flex items-center gap-2 text-muted-foreground mb-4 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => reservation.tenant?.slug && navigate(`/${reservation.tenant.slug}`)}
                        >
                          <Building2 className="w-4 h-4" />
                          <span className="text-sm">
                            {reservation.tenant.name}
                            {reservation.tenant.phone_number && ` • ${reservation.tenant.phone_number}`}
                          </span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => navigate(getNavPath(`/reservation/${reservation.id}`, reservation.tenant?.slug))}
                          className="flex-1 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold px-4 py-2 rounded-lg"
                        >
                          View Details
                        </Button>
                        <Button 
                          onClick={() => navigate(getNavPath(`/vehicles/${reservation.car_id}`, reservation.tenant?.slug))}
                          variant="outline"
                          className="px-4 py-2 rounded-lg"
                        >
                          Car Info
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-12 text-center">
              <CarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No active or upcoming reservations.</p>
            </div>
          )}
        </div>


        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-4xl font-bold">Previous Reservations</h2>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {previousReservations.length > 0 ? (
            <div className="bg-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-semibold">Car</th>
                      <th className="text-left p-4 font-semibold">Price</th>
                      <th className="text-left p-4 font-semibold">Duration</th>
                      <th className="text-left p-4 font-semibold">Date</th>
                      <th className="text-left p-4 font-semibold">ID</th>
                      <th className="text-left p-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previousReservations.map((reservation) => {
                      const startDate = new Date(reservation.start_date);
                      const endDate = new Date(reservation.end_date);
                      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                      
                      return (
                        <tr key={reservation.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div className="font-semibold">{reservation.car?.make || "Car"} {reservation.car?.model || ""}</div>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${
                              reservation.status === 'completed' ? 'bg-green-500 text-white' :
                              reservation.status === 'cancelled' ? 'bg-red-500 text-white' :
                              reservation.status === 'confirmed' ? 'bg-blue-500 text-white' :
                              'bg-yellow-500 text-white'
                            }`}>
                              {reservation.status || 'pending'}
                            </span>
                          </td>
                          <td className="p-4 text-[#D32F2F] font-bold">{reservation.total_price.toFixed(2)} DZD</td>
                          <td className="p-4">{days} Day{days !== 1 ? 's' : ''}</td>
                          <td className="p-4">{format(startDate, "dd/MM/yyyy")}</td>
                          <td className="p-4 text-muted-foreground font-mono text-sm">
                            {reservation.confirmation_code || `#RES-${reservation.id.slice(0, 8)}`}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => navigate(getNavPath(`/reservation/${reservation.id}`, reservation.tenant?.slug))}
                                variant="ghost" 
                                size="sm"
                                className="text-[#D32F2F] hover:text-[#B71C1C] hover:bg-[#D32F2F]/10"
                              >
                                View Details
                              </Button>
                              <Button 
                                onClick={() => navigate(getNavPath(`/vehicles/${reservation.car_id}`, reservation.tenant?.slug))}
                                variant="ghost" 
                                size="sm"
                                className="text-muted-foreground hover:text-primary"
                              >
                                Car Info
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-12 text-center">
              <p className="text-muted-foreground text-lg">No previous reservations found.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
