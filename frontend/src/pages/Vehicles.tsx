import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Settings, Fuel, Wind, Heart } from "lucide-react";

const vehicleData = [
  { id: 1, brand: "Mercedes", type: "Sedan", price: 25, transmission: "Automatic", fuel: "PB 95", ac: true },
  { id: 2, brand: "Mercedes", type: "Sport", price: 50, transmission: "Manual", fuel: "PB 95", ac: true },
  { id: 3, brand: "Mercedes", type: "Sedan", price: 45, transmission: "Automatic", fuel: "PB 95", ac: true },
  { id: 4, brand: "Porsche", type: "SUV", price: 40, transmission: "Automatic", fuel: "PB 95", ac: true },
  { id: 5, brand: "Toyota", type: "Sedan", price: 35, transmission: "Manual", fuel: "PB 95", ac: true },
  { id: 6, brand: "Porsche", type: "SUV", price: 50, transmission: "Automatic", fuel: "PB 95", ac: true },
  { id: 7, brand: "Mercedes", type: "Van", price: 50, transmission: "Automatic", fuel: "PB 95", ac: true },
  { id: 8, brand: "Toyota", type: "Sport", price: 60, transmission: "Manual", fuel: "PB 95", ac: true },
  { id: 9, brand: "Maybach", type: "Sedan", price: 70, transmission: "Automatic", fuel: "PB 95", ac: true },
];

const brands = ["Toyota", "Ford", "Mercedes", "BMW", "Jeep", "Audi"];

const Vehicles = () => {
  const [activeFilter, setActiveFilter] = useState("Brand");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="font-heading text-4xl font-bold text-center mb-12">
          Select a vehicle group
        </h1>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {["Brand", "Type", "Starting price", "Ending price"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                activeFilter === filter
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {vehicleData.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative"
            >
              <button className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors">
                <Heart className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <div className="bg-gradient-to-br from-card-dark to-card-dark/80 p-8 h-48 flex items-center justify-center">
                <div className="w-full h-32 bg-muted/30 rounded-lg"></div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold">{vehicle.brand}</h3>
                    <p className="text-muted-foreground text-sm">{vehicle.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold text-xl">${vehicle.price}</p>
                    <p className="text-muted-foreground text-xs">per day</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Settings className="w-4 h-4" />
                    <span>{vehicle.transmission}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fuel className="w-4 h-4" />
                    <span>{vehicle.fuel}</span>
                  </div>
                  {vehicle.ac && (
                    <div className="flex items-center gap-1">
                      <Wind className="w-4 h-4" />
                      <span>Air Conditioner</span>
                    </div>
                  )}
                </div>
                
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg h-11">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Brand Logos */}
        <div className="flex flex-wrap justify-center items-center gap-12 py-12">
          {brands.map((brand) => (
            <div key={brand} className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
              <div className="text-2xl font-bold text-foreground">{brand}</div>
            </div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Vehicles;
