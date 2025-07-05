import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layouts/MainLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useLocation } from "wouter";

interface PortfolioItem {
  id: number;
  userId: number;
  assetSymbol: string;
  assetType: string;
  quantity: number;
  averagePrice: number;
  createdAt: string;
  updatedAt: string;
  currentPrice?: number;
  totalValue?: number;
  profitLoss?: number;
  profitLossPercent?: number;
}

// Mock current prices for portfolio items
const getCurrentPrice = (symbol: string): number => {
  const mockPrices: Record<string, number> = {
    AAPL: 182.63,
    MSFT: 376.17,
    TSLA: 217.58,
    NVDA: 487.21,
    AMZN: 178.75,
    GOOGL: 142.62,
    META: 330.92,
    BTC: 42830.51,
    ETH: 3285.12,
  };
  
  return mockPrices[symbol] || 100.00;
};

export default function Portfolio() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch portfolio data
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/portfolio'],
  });
  
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load portfolio data",
      variant: "destructive",
    });
  }
  
  const portfolioItems: PortfolioItem[] = data?.portfolio || [];
  
  // Enhance portfolio items with current prices and calculations
  const enhancedPortfolio = portfolioItems.map(item => {
    const currentPrice = getCurrentPrice(item.assetSymbol);
    const totalValue = item.quantity * currentPrice;
    const investedValue = item.quantity * item.averagePrice;
    const profitLoss = totalValue - investedValue;
    const profitLossPercent = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;
    
    return {
      ...item,
      currentPrice,
      totalValue,
      profitLoss,
      profitLossPercent,
    };
  });
  
  // Calculate portfolio summary
  const totalInvested = enhancedPortfolio.reduce((acc, item) => 
    acc + (item.quantity * item.averagePrice), 0);
    
  const totalValue = enhancedPortfolio.reduce((acc, item) => 
    acc + (item.totalValue || 0), 0);
    
  const totalProfitLoss = totalValue - totalInvested;
  const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
  
  // Prepare data for charts
  const assetDistribution = enhancedPortfolio.map(item => ({
    name: item.assetSymbol,
    value: item.totalValue || 0,
  }));
  
  const assetPerformance = enhancedPortfolio.map(item => ({
    name: item.assetSymbol,
    profitLoss: item.profitLoss || 0,
  }));
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Loading state
  if (isLoading) {
    return (
      <MainLayout title="Portfolio">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout title="Portfolio">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Total Value</h2>
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold">${totalValue.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Total Invested</h2>
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold">${totalInvested.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Profit/Loss</h2>
            <div className="flex items-baseline">
              <span className={`text-3xl font-semibold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalProfitLoss.toFixed(2)}
              </span>
              <span className={`ml-2 text-sm ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ({totalProfitLossPercent.toFixed(2)}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {enhancedPortfolio.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Avg. Price</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Profit/Loss</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enhancedPortfolio.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.assetSymbol}</TableCell>
                        <TableCell className="capitalize">{item.assetType}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.averagePrice.toFixed(2)}</TableCell>
                        <TableCell>${item.currentPrice?.toFixed(2)}</TableCell>
                        <TableCell>${item.totalValue?.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {(item.profitLoss || 0) >= 0 ? (
                              <>
                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                <span className="text-green-600">${item.profitLoss?.toFixed(2)} ({item.profitLossPercent?.toFixed(2)}%)</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                                <span className="text-red-600">${item.profitLoss?.toFixed(2)} ({item.profitLossPercent?.toFixed(2)}%)</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm"
                            onClick={() => navigate(`/trade?symbol=${item.assetSymbol}`)}
                          >
                            Trade
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You don't have any assets in your portfolio yet.</p>
                  <Button onClick={() => navigate("/trade")}>Start Trading</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="assets">
              {enhancedPortfolio.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {assetDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Value']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You don't have any assets in your portfolio yet.</p>
                  <Button onClick={() => navigate("/trade")}>Start Trading</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="analytics">
              {enhancedPortfolio.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={assetPerformance}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Profit/Loss']}
                      />
                      <Legend />
                      <Bar 
                        dataKey="profitLoss" 
                        name="Profit/Loss" 
                        fill={(datum) => datum.profitLoss >= 0 ? '#10B981' : '#EF4444'}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You don't have any assets in your portfolio yet.</p>
                  <Button onClick={() => navigate("/trade")}>Start Trading</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
