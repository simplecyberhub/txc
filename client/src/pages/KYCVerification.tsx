import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/MainLayout";
import KYCForm from "@/components/auth/KYCForm";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import styles from "./KYCVerification.module.css";

export default function KYCVerification() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("status");
  
  // Define the expected KYC status shape
  type KYCStatusResponse = {
    kyc?: {
      status?: "none" | "pending" | "approved" | "rejected";
      createdAt?: string;
      updatedAt?: string;
      rejectionReason?: string;
    };
  };

  // Fetch KYC status
  const { data, isLoading, error } = useQuery<KYCStatusResponse>({
    queryKey: ['/api/kyc/status'],
  });
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load KYC status",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  const kycStatus = data?.kyc?.status || "none";
  
  const renderStatusContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading KYC Status</h2>
          <p className="text-gray-600">Please wait while we check your verification status...</p>
        </div>
      );
    }
    
    if (kycStatus === "none") {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">KYC Not Submitted</h2>
          <p className="text-gray-600 mb-6 text-center">
            You have not submitted your KYC verification documents yet. Please complete the verification to unlock all platform features.
          </p>
          <Button onClick={() => setActiveTab("submit")} className="bg-primary text-white">
            Start Verification
          </Button>
        </div>
      );
    }
    if (kycStatus === "pending") {
      return (
        <>
          <div className="flex flex-col items-center justify-center py-8">
            <Clock className="h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">KYC In Review</h2>
            <Badge className="bg-yellow-100 text-yellow-800 mb-4">Pending</Badge>
            <p className="text-gray-600 mb-6 text-center">
              Your KYC verification is currently under review. This process typically takes 24-48 hours.
            </p>
            <div className="w-full max-w-sm bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
              <div className="bg-yellow-500 h-2.5 rounded-full kyc-progress-bar"></div>
            </div>
            <p className="text-sm text-gray-500">
              Submitted on: {data?.kyc?.createdAt ? new Date(data.kyc.createdAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </>
      );
    }
    
    if (kycStatus === "approved") {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">KYC Verified</h2>
          <Badge className="bg-green-100 text-green-800 mb-4">Approved</Badge>
          <p className="text-gray-600 mb-6 text-center">
            Your identity has been successfully verified. You now have full access to all platform features.
          </p>
          <div className="w-full max-w-sm bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
            <div className="bg-green-500 h-2.5 rounded-full w-full"></div>
          </div>
          <p className="text-sm text-gray-500">
            Verified on: {data?.kyc?.updatedAt ? new Date(data.kyc.updatedAt).toLocaleDateString() : "N/A"}
          </p>
        </div>
      );
    }
    
    if (kycStatus === "rejected") {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">KYC Rejected</h2>
          <Badge className="bg-red-100 text-red-800 mb-4">Rejected</Badge>
          <p className="text-gray-600 mb-2 text-center">
            Your KYC verification was not approved. Please submit your documents again.
          </p>
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md w-full max-w-sm">
            <p className="text-sm text-red-700">
              <strong>Reason:</strong> {data?.kyc?.rejectionReason || "Invalid or unclear documents"}
            </p>
          </div>
          <Button onClick={() => setActiveTab("submit")} className="bg-primary text-white">
            Resubmit Documents
          </Button>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <MainLayout title="KYC Verification">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="status">Verification Status</TabsTrigger>
                <TabsTrigger 
                  value="submit" 
                  disabled={kycStatus === "approved" || kycStatus === "pending"}
                >
                  Submit Documents
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="status">
                {renderStatusContent()}
              </TabsContent>
              
              <TabsContent value="submit">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Identity Verification</h2>
                  <p className="text-gray-600">
                    Please provide the required documents to verify your identity. This helps us maintain a secure trading environment.
                  </p>
                </div>
                <KYCForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
