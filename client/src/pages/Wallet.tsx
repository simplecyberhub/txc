import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layouts/MainLayout";
import WalletActions from "@/components/wallet/WalletActions";
import TransactionItem from "@/components/wallet/TransactionItem";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Wallet, LineChart, Loader2, AlertTriangle, CreditCard } from "lucide-react";

export default function WalletPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [location] = useLocation();
  
  // Get action from URL if available
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const actionParam = searchParams.get("action");
  
  // Fetch wallet data
  const { data: walletData, isLoading: isLoadingWallet, error: walletError } = useQuery({
    queryKey: ['/api/wallet'],
  });
  
  // Fetch transactions
  const { data: transactionsData, isLoading: isLoadingTransactions, error: transactionsError } = useQuery({
    queryKey: ['/api/transactions'],
  });
  
  // Set initial action tab if provided in URL
  useEffect(() => {
    if (actionParam === "deposit" || actionParam === "withdraw") {
      setActiveTab("actions");
    }
  }, [actionParam]);
  
  // Show error toast if any queries fail
  useEffect(() => {
    if (walletError) {
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
    }
    
    if (transactionsError) {
      toast({
        title: "Error",
        description: "Failed to load transactions data",
        variant: "destructive",
      });
    }
  }, [walletError, transactionsError, toast]);
  
  // Process data
  const wallet = walletData?.wallet;
  const transactions = transactionsData?.transactions || [];
  
  // Loading state
  if (isLoadingWallet || isLoadingTransactions) {
    return (
      <MainLayout title="Wallet">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }
  
  // Calculate stats
  const pendingTransactions = transactions.filter(t => t.status === "pending").length;
  const totalDeposited = transactions
    .filter(t => t.type === "deposit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawn = transactions
    .filter(t => t.type === "withdrawal" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  
  return (
    <MainLayout title="Wallet">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wallet Management</h1>
        <p className="text-gray-600">
          View your balance, deposit funds, and request withdrawals
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-gray-900">Available Balance</h2>
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold">${wallet?.balance.toFixed(2) || "0.00"}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-gray-900">Total Deposited</h2>
              <LineChart className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold">${totalDeposited.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-gray-900">Pending Transactions</h2>
              <CreditCard className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold">{pendingTransactions}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Wallet Management</CardTitle>
          <CardDescription>
            Manage your funds and track your transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="actions">Deposit/Withdraw</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Asset</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.length > 0 ? (
                            transactions.slice(0, 5).map((transaction) => (
                              <TransactionItem key={transaction.id} {...transaction} />
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6">
                                No transactions yet. Make a deposit to get started.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <WalletActions 
                        initialTab={actionParam || "deposit"} 
                        walletBalance={wallet?.balance || 0}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Verification Notice */}
              {!wallet?.user?.isVerified && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Verification Required</h4>
                    <p className="text-sm text-yellow-700">
                      To unlock withdrawals and higher deposit limits, please complete your KYC verification.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="transactions">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <TransactionItem key={transaction.id} {...transaction} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No transactions yet. Make a deposit to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="actions">
              <div className="max-w-md mx-auto">
                <WalletActions 
                  initialTab={actionParam || "deposit"} 
                  walletBalance={wallet?.balance || 0}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
