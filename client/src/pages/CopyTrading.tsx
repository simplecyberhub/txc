import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { generateHistoricalData } from "@/lib/stocksData";
import { useToast } from "@/hooks/use-toast";
import { ChevronUp, ChevronDown, Users, Info } from "lucide-react";

// Mock traders data
const traders = [
  {
    id: 1,
    name: "Alex Johnson",
    username: "alextrader",
    avatarUrl: "",
    performance: {
      monthly: 12.4,
      allTime: 76.8,
    },
    trades: 324,
    followers: 847,
    risk: "Medium",
    description: "Experienced day trader with focus on tech stocks and trend following strategies.",
    chartData: generateHistoricalData(30, 100, 0.02),
  },
  {
    id: 2,
    name: "Sarah Williams",
    username: "sarahw",
    avatarUrl: "",
    performance: {
      monthly: 8.2,
      allTime: 45.3,
    },
    trades: 156,
    followers: 412,
    risk: "Low",
    description: "Conservative trader focusing on blue-chip stocks and long-term investment strategies.",
    chartData: generateHistoricalData(30, 100, 0.01),
  },
  {
    id: 3,
    name: "Michael Chen",
    username: "michaeltrades",
    avatarUrl: "",
    performance: {
      monthly: -3.7,
      allTime: 28.5,
    },
    trades: 276,
    followers: 319,
    risk: "High",
    description: "Aggressive trader specializing in momentum stocks and market swings.",
    chartData: generateHistoricalData(30, 100, 0.03),
  },
  {
    id: 4,
    name: "Emily Roberts",
    username: "emilyr",
    avatarUrl: "",
    performance: {
      monthly: 5.8,
      allTime: 62.1,
    },
    trades: 198,
    followers: 523,
    risk: "Medium",
    description: "Balanced approach with focus on dividend stocks and sector rotation strategies.",
    chartData: generateHistoricalData(30, 100, 0.015),
  },
];

// Mock my following data
const myFollowing = [
  {
    id: 1,
    traderId: 1,
    amount: 1000,
    startDate: "2023-05-15",
    profit: 124,
  }
];

export default function CopyTrading() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedTrader, setSelectedTrader] = useState<any>(null);

  const handleFollow = (trader: any) => {
    toast({
      title: "Feature Not Available",
      description: "Copy trading functionality is not implemented in this demo.",
      variant: "default",
    });
  };

  const handleViewDetails = (trader: any) => {
    setSelectedTrader(trader);
  };

  const handleCloseDetails = () => {
    setSelectedTrader(null);
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "High":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <MainLayout title="Copy Trading">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Copy Trading</h1>
        <p className="text-gray-600">
          Automatically copy the trades of experienced investors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Copy Trading Platform</CardTitle>
          <CardDescription>
            Choose traders to follow and automatically replicate their trades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="discover">Discover Traders</TabsTrigger>
              <TabsTrigger value="following">My Following</TabsTrigger>
            </TabsList>

            <TabsContent value="discover">
              <div className="grid grid-cols-1 gap-6">
                {traders.map((trader) => (
                  <Card key={trader.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                        <div className="p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary text-white">
                                {trader.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-gray-900">{trader.name}</h3>
                              <p className="text-sm text-gray-500">@{trader.username}</p>
                              <div className="mt-2">
                                <Badge className={getRiskBadgeColor(trader.risk)}>
                                  {trader.risk} Risk
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 text-sm text-gray-600 line-clamp-3">
                            {trader.description}
                          </div>
                        </div>

                        <div className="p-6">
                          <h4 className="text-sm font-medium text-gray-500 mb-4">Performance</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">30 Days:</span>
                              <span className={`font-medium ${trader.performance.monthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trader.performance.monthly >= 0 ? "+" : ""}{trader.performance.monthly}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">All Time:</span>
                              <span className={`font-medium ${trader.performance.allTime >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trader.performance.allTime >= 0 ? "+" : ""}{trader.performance.allTime}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Trades:</span>
                              <span className="font-medium text-gray-900">{trader.trades}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Followers:</span>
                              <span className="font-medium text-gray-900">{trader.followers}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 h-[180px]">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Performance Chart (30d)</h4>
                          <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={trader.chartData}>
                              <XAxis dataKey="date" hide />
                              <YAxis hide domain={['auto', 'auto']} />
                              <Tooltip
                                formatter={(value: any) => [`$${value}`, 'Value']}
                                labelFormatter={(label) => `Date: ${label}`}
                              />
                              <Line
                                type="monotone"
                                dataKey="price"
                                stroke={trader.performance.monthly >= 0 ? "#10B981" : "#EF4444"}
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="p-6 flex flex-col justify-center items-center">
                          <Button onClick={() => handleViewDetails(trader)} variant="outline" className="w-full mb-2">
                            View Details
                          </Button>
                          <Button onClick={() => handleFollow(trader)} className="w-full">
                            Follow Trader
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="following">
              {myFollowing.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trader</TableHead>
                      <TableHead>Following Since</TableHead>
                      <TableHead>Amount Allocated</TableHead>
                      <TableHead>Profit/Loss</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myFollowing.map((following) => {
                      const trader = traders.find(t => t.id === following.traderId);
                      if (!trader) return null;
                      
                      return (
                        <TableRow key={following.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-white">
                                  {trader.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{trader.name}</p>
                                <p className="text-xs text-gray-500">@{trader.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(following.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>${following.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {following.profit >= 0 ? (
                                <>
                                  <ChevronUp className="h-4 w-4 text-green-600 mr-1" />
                                  <span className="text-green-600">+${following.profit.toFixed(2)} ({(following.profit / following.amount * 100).toFixed(2)}%)</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 text-red-600 mr-1" />
                                  <span className="text-red-600">-${Math.abs(following.profit).toFixed(2)} ({(Math.abs(following.profit) / following.amount * 100).toFixed(2)}%)</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(trader)}>
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">You're not following any traders</h3>
                  <p className="text-gray-500 mb-4">Start copying successful traders to automate your trading strategy</p>
                  <Button onClick={() => setActiveTab("discover")}>Discover Traders</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Trader Details Modal */}
      {selectedTrader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-white">
                      {selectedTrader.name.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedTrader.name}</CardTitle>
                    <CardDescription>@{selectedTrader.username}</CardDescription>
                  </div>
                </div>
                <Badge className={getRiskBadgeColor(selectedTrader.risk)}>
                  {selectedTrader.risk} Risk
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">About</h3>
                <p className="text-gray-600">{selectedTrader.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Performance</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedTrader.chartData}>
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
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value: any) => [`$${value}`, 'Value']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={selectedTrader.performance.monthly >= 0 ? "#10B981" : "#EF4444"}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Monthly Performance</h4>
                    <p className={`text-2xl font-semibold ${selectedTrader.performance.monthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedTrader.performance.monthly >= 0 ? "+" : ""}{selectedTrader.performance.monthly}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">All-Time Performance</h4>
                    <p className={`text-2xl font-semibold ${selectedTrader.performance.allTime >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedTrader.performance.allTime >= 0 ? "+" : ""}{selectedTrader.performance.allTime}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Total Followers</h4>
                    <p className="text-2xl font-semibold text-gray-900">{selectedTrader.followers}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Copy Trading Information</h4>
                  <p className="text-sm text-blue-700">
                    When you follow a trader, their trades will be automatically replicated in your account
                    proportionally to your allocated amount. Please note that past performance is not indicative
                    of future results.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleCloseDetails}>
                Close
              </Button>
              <Button onClick={() => handleFollow(selectedTrader)}>
                Follow Trader
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}
