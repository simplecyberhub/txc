import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { PlusCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { popularStocks } from "@/lib/stocksData";

interface WatchlistItem {
  id: number;
  assetSymbol: string;
  assetName: string;
  assetType: string;
  exchange: string;
}

export default function Watchlist() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Fetch watchlist with proper type and error handling
  const { data, isLoading } = useQuery<{watchlist: WatchlistItem[]}>({
    queryKey: ['/api/watchlist'],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (res.status === 401) {
          // Handle auth error silently - this will prevent the infinite loop
          return { watchlist: [] };
        }
        
        if (!res.ok) {
          throw new Error(`Error fetching watchlist: ${res.status}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error("Watchlist fetch error:", error);
        return { watchlist: [] };
      }
    },
  });
  
  // Remove from watchlist mutation
  const removeFromWatchlist = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/watchlist/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Success",
        description: "Asset removed from watchlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from watchlist",
        variant: "destructive",
      });
    }
  });
  
  // Add to watchlist mutation
  const addToWatchlist = useMutation({
    mutationFn: async (stock: any) => {
      const watchlistItem = {
        assetSymbol: stock.symbol,
        assetName: stock.name,
        assetType: stock.exchange === "Crypto" ? "crypto" : "stock",
        exchange: stock.exchange,
      };
      
      const res = await apiRequest("POST", "/api/watchlist", watchlistItem);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Success",
        description: "Asset added to watchlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to watchlist",
        variant: "destructive",
      });
    }
  });
  
  const handleRemoveFromWatchlist = (id: number) => {
    removeFromWatchlist.mutate(id);
  };
  
  if (isLoading) {
    return (
      <Card className="bg-white">
        <CardHeader className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Watchlist</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Get watchlist or empty array if no data
  const watchlist: WatchlistItem[] = data?.watchlist || [];
  
  // If empty watchlist, show suggested stocks from popular stocks
  const displayItems = watchlist.length > 0 
    ? watchlist 
    : popularStocks.slice(0, 5).map((stock, index) => ({
        ...stock,
        id: index,
        assetSymbol: stock.symbol,
        assetName: stock.name,
        assetType: stock.exchange === "Crypto" ? "crypto" : "stock",
        suggested: true
      }));
  
  return (
    <Card className="bg-white">
      <CardHeader className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Watchlist</h3>
        <Button variant="ghost" size="icon" onClick={() => navigate('/markets')} className="text-primary hover:text-primary/90">
          <PlusCircle className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {displayItems.length > 0 ? (
            displayItems.map((item: any) => (
              <div key={item.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-primary font-medium">
                      {item.assetSymbol}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{item.assetName}</p>
                      <p className="text-xs text-gray-500">{item.exchange}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {item.suggested ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => addToWatchlist.mutate(item)}
                      disabled={addToWatchlist.isPending}
                    >
                      {addToWatchlist.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        "Add"
                      )}
                    </Button>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900">${item.price?.toFixed(2) || "N/A"}</p>
                      <p className={`text-xs ${item.change > 0 ? "text-green-600" : "text-red-600"}`}>
                        {item.change > 0 ? "+" : ""}{item.change?.toFixed(2) || 0}%
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-gray-500">
                Your watchlist is empty. Add stocks or cryptocurrencies to track their performance.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-right">
        <Button 
          variant="link" 
          onClick={() => navigate('/markets')}
          className="text-sm font-medium text-primary hover:text-primary/90"
        >
          Manage watchlist →
        </Button>
      </CardFooter>
    </Card>
  );
}
