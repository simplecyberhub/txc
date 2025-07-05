import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const transactionSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Amount must be a positive number" }
  ),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface WalletActionsProps {
  initialTab?: string;
  walletBalance?: number;
}

export default function WalletActions({ initialTab = "deposit", walletBalance = 0 }: WalletActionsProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    
    const amount = parseFloat(data.amount);
    
    // Check if user has enough balance for withdrawal
    if (activeTab === "withdraw" && amount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds to withdraw this amount",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/transactions", {
        type: activeTab,
        amount,
        currency: "USD",
      });

      const result = await response.json();
      
      if (result.success) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
        queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
        
        toast({
          title: "Success",
          description: `Your ${activeTab} transaction has been ${activeTab === "deposit" ? "completed" : "submitted for approval"}`,
        });
        
        form.reset();
      } else {
        throw new Error(result.message || `Failed to process ${activeTab}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to process ${activeTab}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 mb-6">
        <TabsTrigger value="deposit">Deposit</TabsTrigger>
        <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
      </TabsList>

      <TabsContent value="deposit">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">Deposit Funds</h3>
          <p className="text-sm text-gray-500 mt-1">
            Add funds to your TradeXCapital wallet
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (USD)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-8" 
                        min="1"
                        step="0.01"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Deposit Funds"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> For demo purposes, deposits are processed instantly
          </p>
        </div>
      </TabsContent>

      <TabsContent value="withdraw">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">Withdraw Funds</h3>
          <p className="text-sm text-gray-500 mt-1">
            Withdraw funds from your TradeXCapital wallet
          </p>
        </div>

        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-700">
            <strong>Available Balance:</strong> ${walletBalance.toFixed(2)}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (USD)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-8" 
                        min="10"
                        max={walletBalance}
                        step="0.01"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary text-white"
              disabled={isSubmitting || walletBalance <= 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Withdraw Funds"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> Withdrawals require KYC verification and admin approval
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
