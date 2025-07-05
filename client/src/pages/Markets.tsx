import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layouts/MainLayout";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Star, Search, Loader2 } from "lucide-react";
import { marketIndices, cryptoData, popularStocks } from "@/lib/stocksData";

export default function Markets() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("stocks");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch watchlist with error handling
  const { data: watchlistData, isLoading: isLoadingWatchlist } = useQuery<{watchlist: any[]}>({
    queryKey: ['/api/watchlist'],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });

        if (res.status === 401) {
          // Handle auth error silently
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

  const watchlist = watchlistData?.watchlist || [];

  // Add to watchlist mutation
  const addToWatchlist = useMutation({
    mutationFn: async (asset: any) => {
      const watchlistItem = {
        assetSymbol: asset.symbol,
        assetName: asset.name,
        assetType: activeTab === "crypto" ? "crypto" : "stock",
        exchange: asset.exchange,
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
        description: "Failed to add asset to watchlist",
        variant: "destructive",
      });
    }
  });

  // Remove from watchlist mutation
  const removeFromWatchlist = useMutation({
    mutationFn: async (watchlistItemId: number) => {
      const res = await apiRequest("DELETE", `/api/watchlist/${watchlistItemId}`);
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
        description: "Failed to remove asset from watchlist",
        variant: "destructive",
      });
    }
  });

  // Check if an asset is in the watchlist
  const getWatchlistItem = (symbol: string) => {
    return watchlist.find((item: any) => item.assetSymbol === symbol);
  };

  // Handler for watchlist toggle
  const handleWatchlistToggle = (asset: any) => {
    const watchlistItem = getWatchlistItem(asset.symbol);
    if (watchlistItem) {
      removeFromWatchlist.mutate(watchlistItem.id);
    } else {
      addToWatchlist.mutate(asset);
    }
  };

  // Handler for trade button
  const handleTrade = (symbol: string) => {
    navigate(`/trade?symbol=${symbol}`);
  };

  // Filter assets based on search term
  const filterAssets = (assets: any[]) => {
    if (!searchTerm) return assets;

    return assets.filter(asset => 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredStocks = filterAssets(popularStocks);
  const filteredCrypto = filterAssets(cryptoData);
  const filteredIndices = filterAssets(marketIndices);

  // Render asset table
  const renderAssetTable = (assets: any[]) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>24h Change</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length > 0 ? (
            assets.map((asset) => {
              const watchlistItem = getWatchlistItem(asset.symbol);
              const isInWatchlist = !!watchlistItem;

              return (
                <TableRow key={asset.symbol}>
                  <TableCell className="font-medium">{asset.symbol}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-primary font-medium">
                        {asset?.symbol?.slice(0, 2) || ''}
                      </div>
                      <span>{asset.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>${asset.price || asset.value}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {asset.direction === "up" ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-green-600">+{asset.change}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                          <span className="text-red-600">{asset.change}%</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleWatchlistToggle(asset)}
                      disabled={addToWatchlist.isPending || removeFromWatchlist.isPending}
                    >
                      {(addToWatchlist.isPending || removeFromWatchlist.isPending) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Star className={`h-4 w-4 ${isInWatchlist ? "fill-yellow-400 text-yellow-400" : ""}`} />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleTrade(asset.symbol)}
                    >
                      Trade
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                {searchTerm ? "No assets match your search criteria" : "No assets found"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <MainLayout title="Markets">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Market Overview</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="stocks">Stocks</TabsTrigger>
              <TabsTrigger value="crypto">Cryptocurrencies</TabsTrigger>
              <TabsTrigger value="indices">Indices</TabsTrigger>
            </TabsList>

            <TabsContent value="stocks">
              {renderAssetTable(filteredStocks)}
            </TabsContent>

            <TabsContent value="crypto">
              {renderAssetTable(filteredCrypto)}
            </TabsContent>

            <TabsContent value="indices">
              {renderAssetTable(filteredIndices)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </MainLayout>
  );
}