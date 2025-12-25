import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroCar from "@/assets/car_home.png";
import traceCar from "@/assets/car_trace.png";
import HeroBackground from "@/components/HeroBackground";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  // States: verifying (checking token), idle (form), loading (submitting), success, error
  const [status, setStatus] = useState<"verifying" | "idle" | "loading" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  const API_URL = "http://localhost:3000";

  // 1. Extract token on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      setErrorMessage("Invalid or missing reset token.");
      setStatus("error");
      return;
    }

    const params = new URLSearchParams(hash.substring(1)); // remove #
    const token = params.get("access_token");

    if (token) {
      setAccessToken(token);
      setStatus("idle"); // Token found, show form
    } else {
      setErrorMessage("Invalid link. Please request a new password reset.");
      setStatus("error");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_API_KEY,
        },
        body: JSON.stringify({ 
          token: accessToken,
          newPassword: password 
        }),
      });

      if (res.ok) {
        setStatus("success");
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate("/signin", { 
            state: { message: "Password reset successfully! Please log in with your new password." } 
          });
        }, 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        let message = "Failed to reset password. The link may have expired.";
        
        // Handle NestJS class-validator error array
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
    } finally {
      if (status !== "success") {
        // Only reset loading if not successful (success stays to show success UI)
        // actually setStatus logic handles this implicitly
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroBackground trace={traceCar} car={heroCar}>
        <div className="max-w-md w-full p-8 bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl space-y-6">
          <h2 className="text-3xl font-bold text-center text-white">Set New Password</h2>
          
          {/* VERIFYING STATE */}
          {status === "verifying" && (
            <div className="text-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
               <p className="mt-4 text-white/70">Verifying link...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {status === "error" && (
            <div className="text-center space-y-4">
              <div className="bg-red-500/20 text-red-300 p-4 rounded-lg border border-red-500/30">
                {errorMessage}
              </div>
              <Link to="/forgot-password">
                <Button variant="outline" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                  Request New Link
                </Button>
              </Link>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === "success" && (
            <div className="text-center space-y-4">
               <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Password Reset!</h3>
              <p className="text-white/70">
                Your password has been successfully updated. Redirecting to login...
              </p>
              <Button 
                onClick={() => navigate("/signin")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Login Now
              </Button>
            </div>
          )}

          {/* IDLE / LOADING STATE (FORM) */}
          {(status === "idle" || status === "loading") && (
            <>
              {errorMessage && (
                 <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm text-center">
                   {errorMessage}
                 </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/80 text-white placeholder:text-white/70 focus:ring-primary"
                    required
                    minLength={6}
                    disabled={status === "loading"}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/10 border-white/80 text-white placeholder:text-white/70 focus:ring-primary"
                    required
                    minLength={6}
                    disabled={status === "loading"}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </>
          )}

        </div>
      </HeroBackground>
      <Footer />
    </div>
  );
};

export default ResetPassword;
