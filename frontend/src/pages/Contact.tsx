import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBackground from "@/components/HeroBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import heroCar from "@/assets/hero-car.jpg";
import traceCar from "@/assets/car_trace.png";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section with Contact Form */}
      <HeroBackground trace={traceCar} car={heroCar}>
        <div className="max-w-md">
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-8">
            <h1 className="font-heading text-4xl font-bold text-white mb-6">Contact us.</h1>
            <form className="space-y-4">
              <Input 
                placeholder="Enter your name" 
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50" 
              />
              <Textarea 
                placeholder="Message" 
                className="min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none" 
              />
              <Button className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold h-12 rounded-lg">
                Send
              </Button>
            </form>
          </div>
        </div>
      </HeroBackground>
      
      <Footer />
    </div>
  );
};

export default Contact;
