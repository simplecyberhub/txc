import { useEffect } from "react";
import { useLocation } from "wouter";
import MainLayout from "@/components/layouts/MainLayout";
import TradingInterface from "@/components/trading/TradingInterface";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Trade() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Get symbol from URL if available
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const symbol = searchParams.get("symbol") || "AAPL";
  
  // Check if user is verified for trading
  useEffect(() => {
    if (user && !user.isVerified) {
      toast({
        title: "KYC Required",
        description: "You need to complete KYC verification to trade",
        variant: "destructive",
      });
    }
  }, [user, toast]);
  
  return (
    <MainLayout title="Trade">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trading Platform</h1>
        <p className="text-gray-600">
          Buy and sell stocks and cryptocurrencies in real-time
        </p>
      </div>
      
      <TradingInterface symbol={symbol} />
    </MainLayout>
  );
}
