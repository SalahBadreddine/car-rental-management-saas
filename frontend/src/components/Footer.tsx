import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Facebook, Instagram, X, Youtube } from "lucide-react";
import logo from "@/assets/logo.png"

const Footer = () => {
  const ICON_CONTAINER_CLASS = "w-10 h-10 rounded-full bg-[#D32F2F] flex items-center justify-center flex-shrink-0";
  
  return (
    <footer className="bg-background pt-12 pb-6">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 items-center">
            
            {/* Logo / Brand Name */}
            <div className="flex items-center gap-2">
                <img src={logo} alt="RentoGo Logo" className="w-10 h-10 object-contain" />
                <span className="font-heading font-bold text-xl text-foreground">RentoGo</span>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4">
              <div className={ICON_CONTAINER_CLASS}>
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-base text-muted-foreground">Address</p>
                <p className="text-base font-semibold text-foreground">Oxford Ave. Cary, NC 27511</p>
              </div>
            </div>
            
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className={ICON_CONTAINER_CLASS}>
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-base text-muted-foreground">Email</p>
                <p className="text-base font-semibold text-foreground">nwiger@yahoo.com</p>
              </div>
            </div>
            
            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className={ICON_CONTAINER_CLASS}>
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-base text-muted-foreground">Phone</p>
                <p className="text-base font-semibold text-foreground">+537 547-6401</p>
              </div>
            </div>
        </div>

        <hr className="mb-10"/>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Introductory Text / Social */}
          <div>
            <p className="font-heading text-lg font-normal text-foreground leading-relaxed mb-6">
                Faucibus faucibus <br/>
                pellentesque dictum turpis. <br/>
                Id pellentesque turpis <br/>
                massa a id iaculis lorem t...
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="#" className="w-7 h-7 text-foreground hover:opacity-75 transition-opacity">
                <Facebook className="w-full h-full" />
              </a>
              <a href="#" className="w-7 h-7 text-foreground hover:opacity-75 transition-opacity">
                <Instagram className="w-full h-full" />
              </a>
              <a href="#" className="w-7 h-7 text-foreground hover:opacity-75 transition-opacity">
                <X className="w-full h-full" />
              </a>
              <a href="#" className="w-7 h-7 text-foreground hover:opacity-75 transition-opacity">
                <Youtube className="w-full h-full" />
              </a>
            </div>
          </div>

          {/* Useful links Section */}
          <div>
            <h3 className="font-heading font-bold text-foreground text-xl mb-6">Useful links</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-base text-foreground hover:text-muted-foreground transition-colors">About us</Link></li>
              <li><Link to="/contact" className="text-base text-foreground hover:text-muted-foreground transition-colors">Contact us</Link></li>
              <li><Link to="/rental-policy" className="text-base text-foreground hover:text-muted-foreground transition-colors">Rental Policy</Link></li>
              <li><a href="#" className="text-base text-foreground hover:text-muted-foreground transition-colors">Gallery</a></li>
              <li><a href="#" className="text-base text-foreground hover:text-muted-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="text-base text-foreground hover:text-muted-foreground transition-colors">F.A.Q</a></li>
            </ul>
          </div>

          {/* Vehicles Section */}
          <div>
            <h3 className="font-heading font-bold text-foreground text-xl mb-6">Vehicles</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-base text-foreground hover:text-muted-foreground transition-colors">Sedan</a></li>
              <li><a href="#" className="text-base text-foreground hover:text-muted-foreground transition-colors">Cabriolet</a></li>
              <li><a href="#" className="text-base text-foreground hover:text-muted-foreground transition-colors">Pickup</a></li>
              <li><a href="#" className="text-base text-foreground hover:text-muted-foreground transition-colors">Minivan</a></li>
              <li><a href="#" className="text-base text-foreground hover:text-muted-foreground transition-colors">SUV</a></li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            © Copyright Car Rental Management System 2025. Design by Figma
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;