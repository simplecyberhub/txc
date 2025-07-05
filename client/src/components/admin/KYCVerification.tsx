import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Eye, CheckCircle, XCircle } from "lucide-react";

interface KYC {
  id: number;
  userId: number;
  documentType: string;
  documentId: string;
  documentPath?: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export default function KYCVerification() {
  const { toast } = useToast();
  const [selectedKYC, setSelectedKYC] = useState<KYC | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch pending KYCs
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/kyc/pending'],
  });

  // Approve KYC mutation
  const approveKYC = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/admin/kyc/${id}`, { status: "approved" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc/pending'] });
      toast({
        title: "Success",
        description: "KYC verification approved",
      });
      setModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve KYC verification",
        variant: "destructive",
      });
    }
  });

  // Reject KYC mutation
  const rejectKYC = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/admin/kyc/${id}`, { 
        status: "rejected", 
        rejectionReason: rejectReason 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc/pending'] });
      toast({
        title: "Success",
        description: "KYC verification rejected",
      });
      setModalOpen(false);
      setRejectReason("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject KYC verification",
        variant: "destructive",
      });
    }
  });

  const handleViewKYC = (kyc: KYC) => {
    setSelectedKYC(kyc);
    setModalOpen(true);
  };

  const handleApprove = () => {
    if (selectedKYC) {
      approveKYC.mutate(selectedKYC.id);
    }
  };

  const handleReject = () => {
    if (selectedKYC && rejectReason.trim()) {
      rejectKYC.mutate(selectedKYC.id);
    } else {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load KYC verification data",
      variant: "destructive",
    });
  }

  const pendingKYCs: KYC[] = data?.kycs || [];

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Document ID</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingKYCs.length > 0 ? (
                pendingKYCs.map((kyc) => (
                  <TableRow key={kyc.id}>
                    <TableCell className="font-medium">{kyc.userId}</TableCell>
                    <TableCell className="capitalize">{kyc.documentType}</TableCell>
                    <TableCell>{kyc.documentId}</TableCell>
                    <TableCell>{formatDate(kyc.createdAt)}</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewKYC(kyc)}
                        className="mr-2"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No pending KYC verifications
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* KYC Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>KYC Verification Details</DialogTitle>
            <DialogDescription>
              Review the submitted documents and approve or reject the verification.
            </DialogDescription>
          </DialogHeader>
          
          {selectedKYC && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-sm">{selectedKYC.userId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Document Type</p>
                  <p className="text-sm capitalize">{selectedKYC.documentType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Document ID</p>
                  <p className="text-sm">{selectedKYC.documentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted On</p>
                  <p className="text-sm">{formatDate(selectedKYC.createdAt)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Document Preview</p>
                <div className="border border-gray-200 rounded-md p-4 text-center text-gray-500">
                  Document image would be displayed here
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Rejection Reason (if rejected)</p>
                <Textarea
                  placeholder="Enter reason for rejection"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectKYC.isPending}
            >
              {rejectKYC.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" /> Reject
                </>
              )}
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveKYC.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveKYC.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" /> Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
