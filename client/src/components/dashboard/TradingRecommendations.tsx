import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { stockRecommendations } from "@/lib/stocksData";

export default function TradingRecommendations() {
  const [, navigate] = useLocation();
  
  const handleTradeNow = (symbol: string) => {
    navigate(`/trade?symbol=${symbol}`);
  };
  
  return (
    <Card className="bg-white mb-6">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Trading Recommendations</h3>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stockRecommendations.map((rec, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center mb-1">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-primary font-medium">
                      {rec.symbol}
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-900">{rec.name}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{rec.exchange}</p>
                </div>
                <span className={`px-2 py-1 ${rec.recommendation === "Buy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} text-xs font-medium rounded`}>
                  {rec.recommendation}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Current Price</span>
                  <span className="font-medium">${rec.currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target Price</span>
                  <span className={`font-medium ${rec.recommendation === "Buy" ? "text-green-600" : "text-red-600"}`}>
                    ${rec.targetPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => handleTradeNow(rec.symbol)}
                className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Trade Now
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
