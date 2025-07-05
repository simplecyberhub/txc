import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import VerifyEmailComponent from "@/components/auth/VerifyEmail";

export default function VerifyEmail() {
  // Log the current URL and search parameters when the component mounts
  useEffect(() => {
    const url = window.location.href;
    const searchParams = window.location.search;
    const token = new URLSearchParams(searchParams).get('token');
    
    console.log('Current URL:', url);
    console.log('Search parameters:', searchParams);
    console.log('Token from URL params:', token);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
          <span className="text-white font-bold text-xl">TX</span>
        </div>
        <h1 className="text-2xl font-bold text-primary">TradeXCapital</h1>
        <p className="text-gray-600 mt-1">Trading & Investment Platform</p>
      </div>
      
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 pb-8">
          <VerifyEmailComponent />
        </CardContent>
      </Card>
    </div>
  );
}
