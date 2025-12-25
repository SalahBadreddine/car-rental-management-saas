import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Edit, LogOut, Car as CarIcon, Clock, Calendar, ChevronRight } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  
  // Mock data - in real app, this would come from API/context
  const user = {
    name: "John Karim",
    phone: "+537 547-6401",
    email: "nwiger@yahoo.com",
    address: "Oxford Ave, Cary, NC 27511"
  };

  const rentedCars = [
    {
      id: 1,
      carId: 1, // Mercedes Sedan
      brand: "Mercedes",
      type: "Sedan",
      daysLeft: "One Day Left",
      returnDate: "14/12/2005 At 10:00 AM",
      status: "active"
    },
    {
      id: 2,
      carId: 6, // Porsche SUV
      brand: "Porsche",
      type: "SUV",
      pickupDate: "14/12/2005 At 15:00 PM",
      status: "upcoming"
    }
  ];

  const previousReservations = [
    { id: 1, carId: 1, car: "Mercedes Sedan", price: "$720", days: "4 Days", date: "12/05/2024", reservationId: "#RES-12345" },
    { id: 2, carId: 3, car: "Mercedes Sedan", price: "$720", days: "4 Days", date: "12/05/2024", reservationId: "#RES-12346" },
    { id: 3, carId: 5, car: "Toyota Sedan", price: "$720", days: "4 Days", date: "12/05/2024", reservationId: "#RES-12347" },
    { id: 4, carId: 6, car: "Porsche SUV", price: "$720", days: "4 Days", date: "12/05/2024", reservationId: "#RES-12348" },
    { id: 5, carId: 1, car: "Mercedes Sedan", price: "$720", days: "4 Days", date: "12/05/2024", reservationId: "#RES-12349" },
    { id: 6, carId: 9, car: "Maybach Sedan", price: "$720", days: "4 Days", date: "12/05/2024", reservationId: "#RES-12350" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Personal Information Section */}
        <div className="bg-black rounded-2xl p-8 mb-12 relative overflow-hidden">
          {/* Tire track pattern background */}
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
                <p className="font-heading text-2xl text-white">{user.name}</p>
              </div>
              <Link to="/profile/edit">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Edit className="w-6 h-6" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-white">
                <Phone className="w-5 h-5 text-[#D32F2F]" />
                <span className="text-lg">Phone {user.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Mail className="w-5 h-5 text-[#D32F2F]" />
                <span className="text-lg">Email {user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <MapPin className="w-5 h-5 text-[#D32F2F]" />
                <span className="text-lg">Address {user.address}</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold px-6 py-2 rounded-lg">
                <LogOut className="w-4 h-4 mr-2" />
                LOG OUT
              </Button>
            </div>
          </div>
        </div>

        {/* Rented Cars Section */}
        <div className="mb-12">
          <h2 className="font-heading text-4xl font-bold mb-8">Rented Cars :</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rentedCars.map((car) => (
              <div key={car.id} className="bg-muted rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-card rounded-lg flex items-center justify-center flex-shrink-0">
                    <CarIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-2xl font-bold mb-1">{car.brand}</h3>
                    <p className="text-muted-foreground mb-4">{car.type}</p>
                    
                    {car.status === "active" && (
                      <>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{car.daysLeft}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">Return Date: {car.returnDate}</span>
                        </div>
                      </>
                    )}
                    
                    {car.status === "upcoming" && (
                      <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Pick-Up Date: {car.pickupDate}</span>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => navigate(`/vehicles/${car.carId}`)}
                      className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold px-6 py-2 rounded-lg"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Reservations Section */}
        <div>
          <h2 className="font-heading text-4xl font-bold mb-8">Previous Reservations</h2>
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
                  {previousReservations.map((reservation) => (
                    <tr key={reservation.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-semibold">{reservation.car}</td>
                      <td className="p-4 text-[#D32F2F] font-bold">{reservation.price}</td>
                      <td className="p-4">{reservation.days}</td>
                      <td className="p-4">{reservation.date}</td>
                      <td className="p-4 text-muted-foreground">{reservation.reservationId}</td>
                      <td className="p-4">
                        <Button 
                          onClick={() => navigate(`/vehicles/${reservation.carId}`)}
                          variant="ghost" 
                          size="sm"
                          className="text-[#D32F2F] hover:text-[#B71C1C] hover:bg-[#D32F2F]/10"
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;

