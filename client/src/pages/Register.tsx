import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import RegisterForm from "@/components/auth/RegisterForm";
import { Card, CardContent } from "@/components/ui/card";

export default function Register() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
          <span className="text-white font-bold text-xl">TX</span>
        </div>
        <h1 className="text-2xl font-bold text-primary">TradeXCapital</h1>
        <p className="text-gray-600 mt-1">Trading & Investment Platform</p>
      </div>
      
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
