import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBackground from "@/components/HeroBackground";
import { Button } from "@/components/ui/button";
import { Users, Car as CarIcon, Headphones } from "lucide-react";
import heroCar from "@/assets/hero-car.jpg";
import traceCar from "@/assets/car_trace.png";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <HeroBackground trace={traceCar} car={heroCar}>
        <div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="text-[#D32F2F]">About US</span>
          </h1>
          <p className="text-2xl text-white font-semibold mb-2">Our Story: Driving Your Adventures</p>
          <p className="text-lg text-white/80 leading-relaxed">
            We are committed to providing reliable, affordable, and high-quality car rental services for every journey.
          </p>
        </div>
      </HeroBackground>

      {/* Our Foundation Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">Our Foundation</h2>
            <h3 className="font-heading text-2xl font-semibold text-muted-foreground mb-6">
              More Than Just Transportation
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              RentoGo was founded on the simple principle that renting a car should be easy, transparent, and enjoyable. 
              Since 2025, we've grown from a local service to a trusted national brand.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="w-16 h-16 rounded-full bg-[#D32F2F] flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3">100% Transparency</h3>
                <p className="text-muted-foreground leading-relaxed">
                  No hidden fees, no surprises. What you see is what you pay. We believe clear, honest pricing is the only way to do business.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="w-16 h-16 rounded-full bg-[#D32F2F] flex items-center justify-center mb-4">
                  <CarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3">Modern & Safe Fleet</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our cars are new, meticulously maintained, and feature the latest safety technology to ensure your peace of mind on the road.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="w-16 h-16 rounded-full bg-[#D32F2F] flex items-center justify-center mb-4">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3">24/7 Support</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We're here for you whenever you need us. Our dedicated customer support team is available around the clock for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to hit the road Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">Ready to hit the road?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Whether it's a weekend getaway or a long business trip, we have the perfect vehicle waiting for you. 
              Discover the RentoGo difference today.
            </p>
            <Link to="/vehicles">
              <Button className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold px-8 py-6 text-lg rounded-lg">
                Use our website
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default About;
