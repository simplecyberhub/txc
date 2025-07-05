import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { marketIndices, cryptoData, generateHistoricalData } from "@/lib/stocksData";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

type TimeRange = "1D" | "1W" | "1M" | "1Y";

export default function MarketOverview() {
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>("1W");
  
  // Generate chart data based on selected time range
  const getDaysForRange = (range: TimeRange): number => {
    switch (range) {
      case "1D": return 1;
      case "1W": return 7;
      case "1M": return 30;
      case "1Y": return 365;
      default: return 7;
    }
  };
  
  const chartData = generateHistoricalData(getDaysForRange(activeTimeRange), 4165);
  
  // Combined market data for display
  const marketData = [...marketIndices, ...cryptoData.slice(0, 2)];
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Market Overview</h2>
        <div className="flex space-x-2">
          {["1D", "1W", "1M", "1Y"].map((range) => (
            <Button
              key={range}
              variant={activeTimeRange === range ? "default" : "outline"}
              className={`px-3 py-1 text-sm ${
                activeTimeRange === range 
                  ? "bg-primary text-white border border-primary" 
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTimeRange(range as TimeRange)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>
      
      <Card className="bg-white rounded-lg shadow overflow-hidden">
        <div className="h-[250px] w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                  if (activeTimeRange === "1D") {
                    return value;
                  } else if (activeTimeRange === "1W") {
                    return value.split('-')[2];
                  } else if (activeTimeRange === "1M") {
                    const parts = value.split('-');
                    return `${parts[1]}/${parts[2]}`;
                  } else {
                    const parts = value.split('-');
                    return `${parts[1]}/${parts[0].substring(2)}`;
                  }
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
                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "S&P 500"]}
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
        
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 border-t border-gray-200">
          {marketData.map((market, index) => (
            <div key={index} className="p-4 text-center">
              <p className="text-sm text-gray-500">{market.name}</p>
              <p className="text-lg font-medium">
                {market.name === "Bitcoin" || market.name === "Ethereum" 
                  ? `$${market.value.toLocaleString()}`
                  : market.value.toLocaleString()
                }
              </p>
              <p className={`text-sm ${market.direction === "up" ? "text-green-600" : "text-red-600"}`}>
                {market.direction === "up" ? "+" : ""}{market.change}%
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
