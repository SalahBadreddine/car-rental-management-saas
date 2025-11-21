import { Link, useLocation } from "react-router-dom";
import { Car } from "lucide-react";

const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="bg-muted/50 border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
            <Car className="w-8 h-8" />
            <span className="font-heading font-bold text-xl">RentoGo</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`font-medium transition-colors ${
                isActive("/") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              to="/vehicles"
              className={`font-medium transition-colors ${
                isActive("/vehicles") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Vehicles
            </Link>
            <Link
              to="/signup"
              className={`font-medium transition-colors ${
                isActive("/signup") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              SignUp
            </Link>
            <Link
              to="/about"
              className={`font-medium transition-colors ${
                isActive("/about") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className={`font-medium transition-colors ${
                isActive("/contact") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
