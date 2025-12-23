import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, MapPin } from "lucide-react";

const EditProfile = () => {
  // Mock data - in real app, this would come from API/context
  const user = {
    name: "John Karim",
    phone: "+537 547-6401",
    email: "nwiger@yahoo.com",
    address: "Oxford Ave. Cary, NC 27511"
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Edit Personal Information Section */}
          <div className="bg-black rounded-2xl p-8 relative overflow-hidden">
            {/* Tire track pattern background */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
              }}></div>
            </div>
            
            <div className="relative z-10">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-8">
                Edit Personal Information :
              </h1>
              
              <div className="space-y-6">
                {/* Name Input */}
                <div>
                  <Input
                    defaultValue={user.name}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-lg"
                    placeholder="Enter your name"
                  />
                </div>
                
                {/* Contact Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D32F2F] flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-white">
                      <p className="text-sm mb-1">Phone</p>
                      <p className="font-semibold">{user.phone} |</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D32F2F] flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-white">
                      <p className="text-sm mb-1">Email</p>
                      <p className="font-semibold">{user.email} |</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D32F2F] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-white">
                      <p className="text-sm mb-1">Address</p>
                      <p className="font-semibold">{user.address} |</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Password Section */}
          <div className="bg-card rounded-2xl p-8 border border-border">
            <h2 className="font-heading text-3xl font-bold mb-6">Edit Password</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Old Password</label>
                <Input
                  type="password"
                  placeholder="password"
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">New Password</label>
                <Input
                  type="password"
                  placeholder="password"
                  className="h-12"
                />
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold px-8 py-2 rounded-lg">
                  Confirm changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EditProfile;

