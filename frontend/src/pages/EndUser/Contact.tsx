import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBackground from "@/components/HeroBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { publicApiRequest } from "@/lib/api";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import heroCar from "@/assets/car_home.png";
import traceCar from "@/assets/car_trace.png";

const Contact = () => {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenant?.id) {
      toast({
        title: "Error",
        description: "Unable to identify the rental company. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }
    
    if (!tenant?.contact_email) {
      toast({
        title: "Error",
        description: "Tenant contact email not configured.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await publicApiRequest('/contact/send', 'POST', {
        tenantId: tenant.id,
        tenantEmail: tenant.contact_email,
        tenantName: tenant.name,
        senderName: formData.name,
        senderEmail: formData.email,
        subject: formData.subject || `Contact from ${formData.name}`,
        message: formData.message,
      });

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Message sent!",
          description: "We'll get back to you as soon as possible.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error(response.data?.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Failed to send contact message:', error);
      toast({
        title: "Failed to send",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      

      <HeroBackground trace={traceCar} car={heroCar}>
        <div className="max-w-xl">
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-8">
            <h1 className="font-heading text-4xl font-bold text-white mb-2">Contact us</h1>
            <p className="text-white/70 mb-6">
              Have a question about {tenant?.name || 'our services'}? We'd love to hear from you.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name *" 
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50" 
                required
              />
              <Input 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email *" 
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50" 
                required
              />
              <Input 
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject (optional)" 
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50" 
              />
              <Textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message *" 
                className="min-h-[150px] min-w-[400px] bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                required
              />
              <Button 
                type="submit"
                disabled={isSending}
                className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold h-12 rounded-lg"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </HeroBackground>


      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">Get in Touch</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">

            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <a href={`mailto:${tenant?.contact_email}`} className="text-muted-foreground hover:text-primary transition-colors">
                {tenant?.contact_email || 'contact@example.com'}
              </a>
            </div>


            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Phone</h3>
              <a href={`tel:${tenant?.phone_number}`} className="text-muted-foreground hover:text-primary transition-colors">
                {tenant?.phone_number || '+1 555-123-4567'}
              </a>
            </div>


            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Location</h3>
              <span className="text-muted-foreground">
                {tenant?.name || 'Our Location'}
              </span>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Contact;