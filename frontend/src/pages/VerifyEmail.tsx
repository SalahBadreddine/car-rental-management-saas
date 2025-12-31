import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<"pending" | "verifying" | "success" | "error">("pending");
  

  const email = (location.state as any)?.email || "";
  const message = (location.state as any)?.message || "";

  useEffect(() => {
    const handleVerification = async () => {

      const hash = window.location.hash;
      

      if (!hash) {
        setStatus("pending");
        return;
      }

      setStatus("verifying");

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        try {
          setStatus("success");


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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-md w-full mx-4 p-8 bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl space-y-6 text-center">
        <h2 className="text-3xl font-bold text-white">Email Verification</h2>
        

        {status === "pending" && (
          <div className="space-y-6">
            <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <p className="text-white text-lg font-medium">Check your inbox!</p>
              <p className="text-white/70 text-sm">
                {message || "We've sent a verification link to your email."}
              </p>
              {email && (
                <p className="text-white/90 font-mono text-sm bg-white/10 px-3 py-2 rounded-lg">
                  {email}
                </p>
              )}
            </div>
            <div className="space-y-3 pt-4">
              <p className="text-white/50 text-xs">
                Click the link in the email to verify your account, then you can sign in.
              </p>
              <Button 
                onClick={() => navigate("/signin")}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Go to Sign In
              </Button>
            </div>
          </div>
        )}


        {status === "verifying" && (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
            <p className="text-white/70">Verifying your email address...</p>
          </div>
        )}


        {status === "success" && (
          <div className="space-y-4">
            <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-lg font-medium">Email verified successfully!</p>
            <p className="text-white/70 text-sm">Redirecting you to the login page...</p>
          </div>
        )}


        {status === "error" && (
          <div className="space-y-4">
            <div className="h-16 w-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-lg font-medium">Verification Failed</p>
            <p className="text-white/70 text-sm">
              The verification link may be invalid or expired.
            </p>
            <Button 
              onClick={() => navigate("/signin")}
              className="w-full bg-[#DC2626] hover:bg-[#B71C1C] text-white"
            >
              Back to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
