import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBackground from "@/components/HeroBackground";
import heroCar from "@/assets/car_home.png";
import traceCar from "@/assets/car_trace.png";
import { Button } from "@/components/ui/button";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    const handleVerification = async () => {
      // Parse hash parameters from the URL (Supabase returns tokens in hash)
      const hash = window.location.hash;
      if (!hash) {
        setStatus("error");
        return;
      }

      const params = new URLSearchParams(hash.substring(1)); // remove #
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        try {
          setStatus("success");

          // Redirect to signin with success message after a short delay
          setTimeout(() => {
            navigate("/signin", {
              replace: true,
              state: { message: "Your email has been verified! You can now log in." }
            });
          }, 2000);

        } catch (e) {
          console.error("Error processing verification:", e);
          setStatus("error");
        }
      } else {
        setStatus("error");
      }
    };

    handleVerification();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroBackground trace={traceCar} car={heroCar}>
        <div className="max-w-md w-full p-8 bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl space-y-6 text-center">
          <h2 className="text-3xl font-bold text-white">Email Verification</h2>
          
          {status === "verifying" && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="text-white/70">Verifying your email address...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white text-lg">Email verified successfully!</p>
              <p className="text-white/70 text-sm">Redirecting you to the login page...</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="h-12 w-12 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-white text-lg">Verification Failed</p>
              <p className="text-white/70 text-sm">
                The verification link may be invalid or expired.
              </p>
              <Button 
                onClick={() => navigate("/signin")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Back to Sign In
              </Button>
            </div>
          )}
        </div>
      </HeroBackground>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
