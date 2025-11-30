import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header"; 
import Footer from "@/components/Footer"; 
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button"; 
import heroCar from "@/assets/car_home.png"; 
import traceCar from "@/assets/car_trace.png"; 
import HeroBackground from "@/components/HeroBackground"; 
import { saveTokens, saveUser } from "@/lib/auth"; // Utility functions for saving tokens/user
import { Checkbox } from "@/components/ui/checkbox";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // State for loading
  const [error, setError] = useState<string | null>(null); // State for error messages

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    termsAccepted: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Helper for Checkbox component as it has a different signature
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, termsAccepted: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (!formData.termsAccepted) {
      setError("You must accept the terms.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_API_KEY, 
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.name,
          phoneNumber: formData.phone,
          address: formData.address || null,
          role: "customer",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!data) {
        setError("Invalid server response.");
        return;
      }

      if (!res.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      saveTokens(data.access_token, data.refresh_token);
      saveUser(data.user);

      navigate("/", { replace: true });

    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroBackground trace={traceCar} car={heroCar}>
        <div className="max-w-lg w-full p-8 bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">Sign Up</h2>
          <p className="text-center text-white/70">
            Join RentoGo today to access exclusive car rental deals!
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Display Logic */}
            {error && (
              <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <Input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="bg-white/10 border-white/80 text-white placeholder:text-white/70 focus:ring-primary"
              required
            />
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="bg-white/10 border-white/80 text-white placeholder:text-white/70 focus:ring-primary"
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Password (min 8 characters)"
              value={formData.password}
              onChange={handleChange}
              className="bg-white/10 border-white/80 text-white placeholder:text-white/70 focus:ring-primary"
              required
            />
            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number (e.g., +1234567890)"
              value={formData.phone}
              onChange={handleChange}
              className="bg-white/10 border-white/80 text-white placeholder:text-white/70 focus:ring-primary"
              required
            />
            <Input
              type="text"
              name="address"
              placeholder="Address (Optional)"
              value={formData.address}
              onChange={handleChange}
              className="bg-white/10 border-white/80 text-white placeholder:text-white/70 focus:ring-primary"
            />
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onCheckedChange={handleCheckboxChange}
                className="border-white/80 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label htmlFor="terms" className="text-sm font-medium leading-none text-white/90 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to the <span className="text-primary hover:text-primary/80 cursor-pointer">Terms and Policy</span>
              </label>
            </div>


            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>

          <div className="text-center text-white/70">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:text-primary/80 font-semibold">
              Sign In
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <span className="h-px w-full bg-white/50"></span>
            <span className="text-white/70 text-sm">or</span>
            <span className="h-px w-full bg-white/50"></span>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 bg-white/10 border-white/80 text-white hover:bg-white/20 rounded-lg"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4" 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853" 
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05" 
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335" 
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 bg-white/10 border-white/80 text-white hover:bg-white/20 rounded-lg"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12c0 4.97 3.61 9.1 8.34 9.87v-7H7.9v-2.87h2.44V9.66c0-2.42 1.46-3.75 3.64-3.75 1.04 0 2.21.18 2.21.18v2.42h-1.25c-1.2 0-1.57.75-1.57 1.51v1.85h2.72l-.43 2.87h-2.29v7.02C18.39 21.1 22 16.97 22 12c0-5.52-4.48-10-10-10z"
              />
            </svg>
            Sign up with Facebook
          </Button>
        </div>
      </HeroBackground>
      <Footer />
    </div>
  );
};

export default SignUp;