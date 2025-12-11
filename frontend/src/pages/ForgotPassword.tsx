import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroCar from "@/assets/car_home.png";
import traceCar from "@/assets/car_trace.png";
import HeroBackground from "@/components/HeroBackground";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const API_URL = "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_API_KEY,
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        let message = "Failed to send reset email.";
        
        if (Array.isArray(data.message)) {
          message = data.message.join(", ");
        } else if (data.message) {
          message = data.message;
        }

        setErrorMessage(message);
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An unexpected error occurred.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroBackground trace={traceCar} car={heroCar}>
        <div className="max-w-md w-full p-8 bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">Reset Password</h2>
          
          {status === "success" ? (
            <div className="text-center space-y-6">
              <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Check your email</h3>
                <p className="text-white/70">
                  We've sent a password reset link to <strong>{email}</strong>.
                </p>
              </div>
              <Link to="/signin">
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <p className="text-center text-white/70">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {status === "error" && (
                <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm text-center border border-red-500/30">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/80 text-white placeholder:text-white/70 focus:ring-primary"
                  required
                  disabled={status === "loading"}
                />

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <div className="text-center">
                <Link to="/signin" className="text-sm text-white/60 hover:text-white transition-colors">
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </HeroBackground>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
