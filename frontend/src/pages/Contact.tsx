import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-5xl font-bold text-center mb-12">Contact Us</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Address</h3>
              <p className="text-muted-foreground">Oxford Ave. Cary, NC 27511</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Email</h3>
              <p className="text-muted-foreground">nwiger@yahoo.com</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
                <Phone className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Phone</h3>
              <p className="text-muted-foreground">+537 547-6401</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg">
            <h2 className="font-heading text-2xl font-bold mb-6">Send us a message</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Your Name" className="h-12" />
                <Input type="email" placeholder="Your Email" className="h-12" />
              </div>
              <Input placeholder="Subject" className="h-12" />
              <Textarea placeholder="Your Message" className="min-h-[150px]" />
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 rounded-lg">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
