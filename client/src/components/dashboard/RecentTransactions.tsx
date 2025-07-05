import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  ArrowRight,
  Loader2
} from "lucide-react";

interface Transaction {
  id: number;
  type: string;
  amount: number;
  currency: string;
  status: string;
  assetSymbol?: string;
  assetType?: string;
  createdAt: string;
}

export default function RecentTransactions() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Fetch transactions
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/transactions'],
  });
  
  if (isLoading) {
    return (
      <Card className="bg-white">
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load transaction data",
      variant: "destructive",
    });
  }
  
  // Get transactions or empty array if no data
  const transactions: Transaction[] = data?.transactions || [];
  
  // Take only the most recent 4 transactions
  const recentTransactions = transactions.slice(0, 4);
  
  // Gets the icon for transaction type
  const getTransactionIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'deposit':
        return <Plus className="h-4 w-4 text-blue-600" />;
      case 'withdrawal':
        return <ArrowRight className="h-4 w-4 text-yellow-600" />;
      case 'buy':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'sell':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      default:
        return <Plus className="h-4 w-4 text-gray-600" />;
    }
  };
  
  // Gets the color for transaction type
  const getTransactionColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'deposit':
        return 'bg-blue-100';
      case 'withdrawal':
        return 'bg-yellow-100';
      case 'buy':
        return 'bg-green-100';
      case 'sell':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };
  
  // Gets the status badge color
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  return (
    <Card className="bg-white">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getTransactionColor(transaction.type)} flex items-center justify-center`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{transaction.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{transaction.assetSymbol || transaction.currency}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">${transaction.amount.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No transactions yet. Make a deposit to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-right">
        <Button 
          variant="link" 
          onClick={() => navigate('/wallet')}
          className="text-sm font-medium text-primary hover:text-primary/90"
        >
          View all transactions →
        </Button>
      </CardFooter>
    </Card>
  );
}
