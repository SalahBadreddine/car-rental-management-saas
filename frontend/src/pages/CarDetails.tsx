import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Settings, Fuel, Wind, Users, Calendar, Gauge, Palette, ArrowLeft, Car as CarIcon } from "lucide-react";
import { cars } from "@/data/cars";
import { Car } from "@/types/car";

const CarDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const car: Car | undefined = cars.find((c) => c.id === Number(id));

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col">
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
          {/* Left Column - Car Image */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-card-dark to-card-dark/80 rounded-2xl p-12 h-96 flex items-center justify-center">
              <CarIcon className="w-64 h-64 text-muted-foreground/30" />
            </div>
            
            {/* Additional Images Placeholder */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-card-dark rounded-lg p-4 h-24 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <CarIcon className="w-12 h-12 text-muted-foreground/30" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Car Details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">
                {car.brand} {car.type}
              </h1>
              <p className="text-2xl text-primary font-bold mb-6">
                ${car.price} <span className="text-lg text-muted-foreground">per day</span>
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-lg p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transmission</p>
                  <p className="font-semibold">{car.transmission}</p>
                </div>
              </div>

              <div className="bg-card rounded-lg p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Fuel className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fuel Type</p>
                  <p className="font-semibold">{car.fuel}</p>
                </div>
              </div>

              {car.seats && (
                <div className="bg-card rounded-lg p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seats</p>
                    <p className="font-semibold">{car.seats}</p>
                  </div>
                </div>
              )}

              {car.year && (
                <div className="bg-card rounded-lg p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-semibold">{car.year}</p>
                  </div>
                </div>
              )}

              {car.mileage && (
                <div className="bg-card rounded-lg p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Gauge className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mileage</p>
                    <p className="font-semibold">{car.mileage.toLocaleString()} miles</p>
                  </div>
                </div>
              )}

              {car.color && (
                <div className="bg-card rounded-lg p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="font-semibold">{car.color}</p>
                  </div>
                </div>
              )}

              {car.ac && (
                <div className="bg-card rounded-lg p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wind className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Air Conditioning</p>
                    <p className="font-semibold">Yes</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {car.description ? (
              <div className="bg-card rounded-lg p-6">
                <h2 className="font-heading text-xl font-bold mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{car.description}</p>
              </div>
            ) : (
              <div className="bg-card rounded-lg p-6">
                <h2 className="font-heading text-xl font-bold mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Experience luxury and comfort with this {car.brand} {car.type}. This vehicle combines
                  style, performance, and reliability to provide you with an exceptional driving experience.
                  Perfect for both city driving and long-distance trips.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
              >
                Book Now
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-6 text-lg"
              >
                Add to Wishlist
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Cars Section */}
        <div className="mt-16">
          <h2 className="font-heading text-3xl font-bold mb-8">Similar Cars</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cars
              .filter((c) => c.id !== car.id && (c.brand === car.brand || c.type === car.type))
              .slice(0, 3)
              .map((similarCar) => (
                <div
                  key={similarCar.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => navigate(`/vehicles/${similarCar.id}`)}
                >
                  <div className="bg-gradient-to-br from-card-dark to-card-dark/80 p-8 h-40 flex items-center justify-center">
                    <CarIcon className="w-24 h-24 text-muted-foreground/30" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-xl font-bold mb-2">
                      {similarCar.brand} {similarCar.type}
                    </h3>
                    <p className="text-primary font-bold text-xl mb-4">
                      ${similarCar.price} <span className="text-sm text-muted-foreground">per day</span>
                    </p>
                    <Button
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
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
      </main>
      
      <Footer />
    </div>
  );
};

export default CarDetails;

