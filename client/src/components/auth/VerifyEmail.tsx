import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function VerifyEmailComponent() {
  const { verifyEmail } = useAuth();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Parse the token from URL using the window.location object directly
        // This is more reliable than using wouter's location
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        console.log("Window location search:", window.location.search);
        console.log("Token from window location:", token);

        if (!token) {
          setStatus("error");
          setMessage(
            "No verification token found. Please check your email for the verification link.",
          );
          return;
        }

        // Call the API directly instead of using the auth context
        try {
          const response = await apiRequest("POST", "/api/auth/verify-email", {
            token,
          });
          const data = await response.json();

          if (data.success) {
            setStatus("success");
            setMessage(
              "Your email has been verified successfully. You can now login to your account.",
            );
          } else {
            setStatus("error");
            setMessage(
              data.message ||
                "Failed to verify email. The link may be invalid or expired.",
            );
          }
        } catch (apiError) {
          console.error("API error:", apiError);
          setStatus("error");
          setMessage(
            "There was an error connecting to the server. Please try again later.",
          );
        }
      } catch (error) {
        console.error("Error during verification:", error);
        setStatus("error");
        setMessage(
          "There was an error processing the verification link. Please try again.",
        );
      }
    };

    verifyToken();
  }, []);

  const handleGoToLogin = () => {
    setLocation("/login");
  };

  return (
    <div className="text-center">
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-semibold mb-2">Verifying Your Email</h2>
          <p className="text-gray-600">
            Please wait while we verify your email address...
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <Button onClick={handleGoToLogin}>Go to Login</Button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <Button onClick={handleGoToLogin}>Go to Login</Button>
        </div>
      )}
    </div>
  );
}
