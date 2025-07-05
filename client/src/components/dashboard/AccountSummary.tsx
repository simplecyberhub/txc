import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

export default function AccountSummary() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Define the expected wallet data type
  type WalletData = {
    wallet: {
      balance: number;
      // add other wallet properties here if needed
    };
  };

  // Fetch wallet data
  const { data, isLoading, error } = useQuery<WalletData>({
    queryKey: ['/api/wallet'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const res = await fetch('/api/wallet', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch wallet');
      return res.json();
    },
    enabled: !!user,
  });
  
  const handleDeposit = () => {
    navigate('/wallet?action=deposit');
  };
  
  const handleWithdraw = () => {
    navigate('/wallet?action=withdraw');
  };
  
  // Handle KYC verification button click
  const handleCheckKYCStatus = () => {
    navigate('/kyc');
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="h-24 flex items-center justify-center">
              <div className="animate-pulse h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="h-24 flex items-center justify-center">
              <div className="animate-pulse h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="h-24 flex items-center justify-center">
              <div className="animate-pulse h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load account data",
      variant: "destructive",
    });
  }
  
  const wallet = data?.wallet;
  const currentBalance = wallet?.balance || 0;
  
  // Determine KYC status
  const kycStatus = user?.isVerified 
    ? "Verified" 
    : "Pending";
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Account Balance */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Account Balance</h2>
            <span className="text-xs text-gray-500">Updated now</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-semibold">${currentBalance.toFixed(2)}</span>
            {currentBalance > 0 && (
              <span className="ml-2 text-green-600 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Button onClick={handleDeposit} className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
              Deposit
            </Button>
            <Button onClick={handleWithdraw} variant="outline" className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Active Positions */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Active Positions</h2>
            <span className="rounded-full bg-blue-100 text-primary px-3 py-1 text-xs font-medium">0 Open</span>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Profit/Loss</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gray-300 h-2 rounded-full" style={{width: "0%"}}></div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="link" onClick={() => navigate('/portfolio')} className="text-primary hover:text-primary/90 text-sm font-medium">
              View all positions →
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* KYC Status */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">KYC Status</h2>
            {kycStatus === "Verified" ? (
              <span className="rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs font-medium">Verified</span>
            ) : (
              <span className="rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-medium">Pending</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {kycStatus === "Verified"
              ? "Your account is fully verified. You have access to all features."
              : "Your account verification is in progress. This may take up to 24 hours."}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className={`${kycStatus === "Verified" ? "bg-green-500" : "bg-yellow-500"} h-2 rounded-full`} style={{width: kycStatus === "Verified" ? "100%" : "50%"}}></div>
          </div>
          <Button onClick={handleCheckKYCStatus} variant="outline" className="w-full py-2 px-4 border border-primary text-primary rounded-lg hover:bg-blue-50 transition">
            {kycStatus === "Verified" ? "View Status" : "Check Status"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
