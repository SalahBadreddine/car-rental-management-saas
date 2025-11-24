import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Car as CarIcon, Wallet, ArrowRight, Users, FileText, Gauge } from "lucide-react";
import fordFiesta from "@/assets/ford.png";
import bmwM2 from "@/assets/bwm.png";
import toyota from "@/assets/toyota.png";
import heroCar from "@/assets/car_home.png";
import traceCar from "@/assets/car_trace.png";
import HeroBackground from "@/components/HeroBackground";
import CarCard from "@/components/CarCard";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <HeroBackground trace={traceCar} car={heroCar}>
        <h1 className="font-heading text-5xl md:text-5xl font-bold mb-6 leading-tight text-white">
          Experience the road like
          never before with{" "}
          <span className="text-primary">RentoGo.</span>
        </h1>

        <p className="text-lg text-white/80 mb-8 leading-relaxed">
          Aliquam adipiscing velit semper morbi. Purus non eu cursus porttitor
          tristique et gravida. Quis nunc interdum gravida ullamcorper
        </p>

        <div className="flex flex-wrap gap-4">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 rounded-lg"
          >
            Get your car today
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-black font-semibold px-8 h-12 rounded-lg"
          >
            See all cars
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </HeroBackground>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-3">Availability</h3>
              <p className="text-muted-foreground leading-relaxed">
                Diam tincidunt tincidunt erat at semper fermentum. Id ultricies quis
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CarIcon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-3">Comfort</h3>
              <p className="text-muted-foreground leading-relaxed">
                Gravida auctor fermentum morbi vulputate ac egestas orcidum convallis
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-3">Savings</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pretium convallis id diam sed commodo vestibulum sololris volutpat
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Deals Section */}
      <section className="py-20">
        <div className="mx-auto">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-center mb-16">
            Best deals out there
          </h2>
          
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 p-10"
            style={{ backgroundColor: 'rgba(27, 26, 26, 0.23)' }}
          >
          <CarCard 
            image={fordFiesta} 
            name="Ford Fiesta" 
            price="20" 
          />

          <CarCard 
            image={bmwM2} 
            name="Bmw M2" 
            price="80" 
          />

          <CarCard 
            image={toyota} 
            name="Camaro SS" 
            price="120" 
          />  
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold px-10 py-3 rounded-lg text-base transition-all"
            >
              See all cars
            </Button>
          </div>
        </div>
      </section>

      {/* On Fire Cars Section */}
      <section className="py-20">
        <div className="mx-auto">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-center mb-16">
            On Fire Cars
          </h2>
          
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 p-10"
            style={{ backgroundColor: 'rgba(27, 26, 26, 0.23)' }}
          >
          <CarCard 
            image={fordFiesta} 
            name="Ford Fiesta" 
            price="20" 
          />

          <CarCard 
            image={bmwM2} 
            name="Bmw M2" 
            price="80" 
          />

          <CarCard 
            image={toyota} 
            name="Camaro SS" 
            price="120" 
          />  
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold px-10 py-3 rounded-lg text-base transition-all"
            >
              See all cars
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold mb-4">Facts In Numbers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Amet cras hac orci lacus. Faucibus ipsum lorem non lectus nibh sapien bibendum ultricorper
              lt. Diam tincidunt tincidunt erat at semper fermentum
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <CarIcon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-heading text-3xl font-bold">540+</p>
                  <p className="text-muted-foreground text-sm">Cars</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <Users className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-heading text-3xl font-bold">20k+</p>
                  <p className="text-muted-foreground text-sm">Customers</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-heading text-3xl font-bold">25+</p>
                  <p className="text-muted-foreground text-sm">Years</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <Gauge className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-heading text-3xl font-bold">20m+</p>
                  <p className="text-muted-foreground text-sm">Miles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
