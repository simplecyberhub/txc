import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getStockBySymbol, generateHistoricalData } from "@/lib/stocksData";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

const tradeSchema = z.object({
  assetSymbol: z.string().min(1, "Asset is required"),
  quantity: z.string().min(1, "Quantity is required").refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Quantity must be a positive number" }
  ),
  leverage: z.string().min(1, "Leverage is required"),
  duration: z.number().min(1, "Duration must be at least 1 hour").max(24, "Duration must be at most 24 hours"),
  takeProfit: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  stopLoss: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
});

type TradeFormData = z.infer<typeof tradeSchema>;

const AVAILABLE_STOCKS = {
  'AAPL': { name: 'Apple Inc.', price: 182.63, change: 1.25 },
  'GOOGL': { name: 'Alphabet Inc.', price: 138.21, change: -0.45 },
  'AMZN': { name: 'Amazon.com Inc.', price: 145.68, change: 0.78 },
  'MSFT': { name: 'Microsoft Corp.', price: 378.85, change: 2.15 },
  'TSLA': { name: 'Tesla Inc.', price: 237.45, change: -1.89 },
  'META': { name: 'Meta Platforms Inc.', price: 342.15, change: 1.65 },
  'NVDA': { name: 'NVIDIA Corp.', price: 485.12, change: 3.25 },
  'BTC-USD': { name: 'Bitcoin USD', price: 42568.25, change: -2.15 },
  'ETH-USD': { name: 'Ethereum USD', price: 2245.85, change: 1.45 }
};

interface TradingInterfaceProps {
  symbol?: string;
}

export default function TradingInterface({ symbol = "AAPL" }: TradingInterfaceProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("buy");
  const [stock, setStock] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  // Fetch wallet data
  const { data: walletData } = useQuery({
    queryKey: ['/api/wallet'],
  });

  const walletBalance = walletData?.wallet?.balance || 0;

  useEffect(() => {
    // Get stock data for the symbol
    const stockData = AVAILABLE_STOCKS[symbol] || AVAILABLE_STOCKS['AAPL'];
    setStock(stockData);

    // Generate chart data
    const data = generateHistoricalData(30, stockData.price);
    setChartData(data);
  }, [symbol]);

  const form = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      assetSymbol: "AAPL",
      quantity: "1",
      leverage: "1",
      duration: 1,
    },
  });

  const calculateTotalCost = () => {
    const quantity = parseFloat(form.watch("quantity") || "0");
    const price = stock?.price || 0;
    return (quantity * price).toFixed(2);
  };

  const tradeButtonText = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ${stock?.name || symbol}`;

  const onSubmit = async (data: TradeFormData) => {
    try {
      setIsSubmitting(true);

      // Create trade
      const tradeResponse = await apiRequest("POST", "/api/trades", {
        symbol: data.assetSymbol, // Use selected asset symbol
        type: activeTab,
        quantity: parseFloat(data.quantity),
        leverage: parseFloat(data.leverage),
        duration: data.duration,
        takeProfit: data.takeProfit,
        stopLoss: data.stopLoss
      });

      const tradeResult = await tradeResponse.json();

      if (!tradeResult.success) {
        throw new Error(tradeResult.message || "Failed to create trade");
      }

      toast({
        title: "Trade Successful",
        description: `Successfully placed ${activeTab} order for ${data.quantity} ${data.assetSymbol}`, // Use selected asset symbol
      });

      // Reset form
      form.reset();
    } catch (error: any) {
      toast({
        title: "Trade Failed",
        description: error.message || "Failed to place trade",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }

    const quantity = parseFloat(data.quantity);
    const totalCost = parseFloat(calculateTotalCost());
    const leverage = parseFloat(data.leverage);
    const duration = data.duration;
    const takeProfit = data.takeProfit;
    const stopLoss = data.stopLoss;

    // Check if user has enough balance for buying
    if (activeTab === "buy" && totalCost > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds to complete this purchase",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (!stock || !stock.symbol) {
        toast({
          title: "Error",
          description: "Please select a valid asset first",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (activeTab === "buy") {
        // Prepare portfolio data
        const portfolioData = {
          assetSymbol: stock.symbol,
          assetType: stock.exchange === "Crypto" ? "crypto" : "stock",
          quantity: quantity,
          averagePrice: stock.price,
        };

        // Create portfolio entry
        const portfolioResponse = await apiRequest("POST", "/api/portfolio", portfolioData);
        const portfolioResult = await portfolioResponse.json();

        if (portfolioResult.success) {
          // Create transaction with trade details
          await apiRequest("POST", "/api/transactions", {
            type: "buy",
            amount: totalCost,
            assetSymbol: stock.symbol,
            assetType: stock.exchange === "Crypto" ? "crypto" : "stock",
            leverage,
            duration,
            takeProfit,
            stopLoss,
            orderType: "market"
          });
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
          queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
          queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });

          toast({
            title: "Success",
            description: `Successfully purchased ${quantity} ${stock.symbol} shares`,
          });

          form.reset();
        } else {
          throw new Error(portfolioResult.message || "Failed to process purchase");
        }
      } else {
        // Sell functionality would go here in a real app
        toast({
          title: "Not Implemented",
          description: "Sell functionality is not implemented in this demo",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process trade",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!stock) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">{stock.name} ({stock.symbol})</CardTitle>
                <p className="text-sm text-gray-500">{stock.exchange}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold">${stock.price.toFixed(2)}</p>
                <p className={`text-sm ${stock.direction === "up" ? "text-green-600" : "text-red-600"}`}>
                  {stock.direction === "up" ? "+" : ""}{stock.change}%
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickMargin={10}
                    tickFormatter={(value) => {
                      const parts = value.split('-');
                      return `${parts[1]}/${parts[2]}`;
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    tickMargin={10} 
                    domain={["auto", "auto"]}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, stock.symbol]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#2563EB" 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Trade {stock.symbol}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>

              <TabsContent value="buy">
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Available Balance:</strong> ${walletBalance.toFixed(2)}
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="assetSymbol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset</FormLabel>
                          <FormControl>
                            <select className="w-full rounded-md border border-gray-300 px-3 py-2" {...field}>
                              {Object.entries(AVAILABLE_STOCKS).map(([symbol, data]) => (
                                <option key={symbol} value={symbol}>
                                  {data.name} (${data.price})
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Price</p>
                      <p className="text-sm text-gray-900">${stock.price.toFixed(2)}</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" min="0.0001" step="0.0001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="leverage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leverage</FormLabel>
                          <FormControl>
                            <select className="w-full rounded-md border border-gray-300 px-3 py-2" {...field}>
                              <option value="1">1x</option>
                              <option value="2">2x</option>
                              <option value="5">5x</option>
                              <option value="10">10x</option>
                            </select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (hours)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              max="24"
                              step="1"
                              placeholder="Enter duration in hours (1-24)"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">Enter duration between 1-24 hours</p>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="takeProfit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Take Profit ($)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="takeProfit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Take Profit ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="text"
                                  inputMode="decimal"
                                  pattern="[0-9]*\.?[0-9]*"
                                  placeholder="Enter TP"
                                  className="w-full"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="stopLoss"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stop Loss ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="text"
                                  inputMode="decimal"
                                  pattern="[0-9]*\.?[0-9]*"
                                  placeholder="Enter SL"
                                  className="w-full"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700">Total Cost</p>
                      <p className="text-sm font-semibold text-gray-900">${calculateTotalCost()}</p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary text-white"
                      disabled={isSubmitting || parseFloat(calculateTotalCost()) > walletBalance}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        tradeButtonText
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="sell">
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> Sell functionality is not implemented in this demo
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Price</p>
                      <p className="text-sm text-gray-900">${stock.price.toFixed(2)}</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" min="0.0001" step="0.0001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between py-2 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700">Total Value</p>
                      <p className="text-sm font-semibold text-gray-900">${calculateTotalCost()}</p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary text-white"
                      disabled={!values.symbol}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        tradeButtonText
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}