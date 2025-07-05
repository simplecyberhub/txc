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
import { Loader2, Eye, CheckCircle, XCircle } from "lucide-react";

interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  currency: string;
  status: string;
  assetSymbol?: string;
  assetType?: string;
  createdAt: string;
}

export default function WalletTransactions() {
  const { toast } = useToast();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch pending transactions
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/transactions/pending'],
  });

  // Approve transaction mutation
  const approveTransaction = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/admin/transactions/${id}`, { status: "completed" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions/pending'] });
      toast({
        title: "Success",
        description: "Transaction approved and processed",
      });
      setModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve transaction",
        variant: "destructive",
      });
    }
  });

  // Reject transaction mutation
  const rejectTransaction = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/admin/transactions/${id}`, { status: "rejected" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions/pending'] });
      toast({
        title: "Success",
        description: "Transaction rejected",
      });
      setModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject transaction",
        variant: "destructive",
      });
    }
  });

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  const handleApprove = () => {
    if (selectedTransaction) {
      approveTransaction.mutate(selectedTransaction.id);
    }
  };

  const handleReject = () => {
    if (selectedTransaction) {
      rejectTransaction.mutate(selectedTransaction.id);
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
      description: "Failed to load transaction data",
      variant: "destructive",
    });
  }

  const pendingTransactions: Transaction[] = data?.transactions || [];

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get transaction type label
  const getTransactionTypeLabel = (type: string) => {
    switch(type.toLowerCase()) {
      case 'deposit':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Deposit</Badge>;
      case 'withdrawal':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Withdrawal</Badge>;
      case 'buy':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Buy</Badge>;
      case 'sell':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Sell</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{type}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingTransactions.length > 0 ? (
                pendingTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.userId}</TableCell>
                    <TableCell>{getTransactionTypeLabel(transaction.type)}</TableCell>
                    <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>{transaction.currency}</TableCell>
                    <TableCell>{transaction.assetSymbol || "-"}</TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewTransaction(transaction)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No pending transactions
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Review the transaction and approve or reject it.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                  <p className="text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-sm">{selectedTransaction.userId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-sm capitalize">{selectedTransaction.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-sm">${selectedTransaction.amount.toFixed(2)} {selectedTransaction.currency}</p>
                </div>
                {selectedTransaction.assetSymbol && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Asset Symbol</p>
                      <p className="text-sm">{selectedTransaction.assetSymbol}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Asset Type</p>
                      <p className="text-sm capitalize">{selectedTransaction.assetType || "-"}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-sm">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectTransaction.isPending}
            >
              {rejectTransaction.isPending ? (
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
              disabled={approveTransaction.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveTransaction.isPending ? (
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
