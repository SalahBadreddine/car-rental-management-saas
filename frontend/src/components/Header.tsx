import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { getAccessToken, logout } from "@/lib/auth";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();             
    navigate("/signin");  
  };

  const userLoggedIn = !!getAccessToken(); // check if user is logged in
  const hideNav = ["/signin", "/signup"].includes(location.pathname);

  return (
    <header className="bg-muted/50 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity">
            <img src={logo} alt="Logo" className="h-8" />
            <span className="font-heading font-bold text-xl">RentoGo</span>
          </Link>

          {!hideNav && (
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/vehicles"
                className={`font-medium transition-colors ${
                  isActive("/vehicles") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Vehicles
              </Link>
              
              {userLoggedIn && (
                <Link
                  to="/profile"
                  className={`font-medium transition-colors ${
                    isActive("/profile") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Profile
                </Link>
              )}

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

              {userLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className={`font-medium transition-colors ${
                      isActive("/signin") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className={`font-medium transition-colors ${
                      isActive("/signup") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
