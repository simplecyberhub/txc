// This is a utility file for mock stock market data

// Stock market index data
export const marketIndices = [
  {
    name: "S&P 500",
    value: 4165.48,
    change: 1.21,
    direction: "up"
  },
  {
    name: "NASDAQ",
    value: 13729.63,
    change: 0.87,
    direction: "up"
  },
  {
    name: "Dow Jones",
    value: 33550.27,
    change: 0.98,
    direction: "up"
  },
  {
    name: "Russell 2000",
    value: 1978.86,
    change: -0.54,
    direction: "down"
  }
];

// Cryptocurrency data
export const cryptoData = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    value: 42830.51,
    change: -2.14,
    direction: "down"
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    value: 3285.12,
    change: 3.45,
    direction: "up"
  },
  {
    symbol: "BNB",
    name: "Binance Coin",
    value: 574.32,
    change: 1.2,
    direction: "up"
  },
  {
    symbol: "SOL",
    name: "Solana",
    value: 107.65,
    change: 5.78,
    direction: "up"
  }
];

// Stock recommendations
export const stockRecommendations = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    exchange: "NASDAQ",
    currentPrice: 487.21,
    targetPrice: 520.00,
    recommendation: "Buy"
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    exchange: "NASDAQ",
    currentPrice: 178.75,
    targetPrice: 195.00,
    recommendation: "Buy"
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase",
    exchange: "NYSE",
    currentPrice: 183.92,
    targetPrice: 170.00,
    recommendation: "Sell"
  }
];

// Popular stocks for watchlist
export const popularStocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    price: 182.63,
    change: 1.43,
    direction: "up"
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    exchange: "NASDAQ",
    price: 376.17,
    change: 0.87,
    direction: "up"
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    exchange: "NASDAQ",
    price: 217.58,
    change: -2.31,
    direction: "down"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    exchange: "NASDAQ",
    price: 142.62,
    change: 0.54,
    direction: "up"
  },
  {
    symbol: "META",
    name: "Meta Platforms",
    exchange: "NASDAQ",
    price: 330.92,
    change: 1.67,
    direction: "up"
  }
];

// Sample transaction types
export const transactionTypes = [
  { name: "Deposit", icon: "plus", color: "blue" },
  { name: "Withdrawal", icon: "arrow-right", color: "yellow" },
  { name: "Buy", icon: "arrow-up", color: "green" },
  { name: "Sell", icon: "arrow-down", color: "red" }
];

// Sample transaction statuses
export const transactionStatuses = [
  { name: "Completed", color: "green" },
  { name: "Pending", color: "yellow" },
  { name: "Rejected", color: "red" }
];

// Function to generate random historical price data for charts
export function generateHistoricalData(days = 30, startPrice = 100, volatility = 0.02) {
  const data = [];
  let price = startPrice;
  
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    // Random price movement
    const change = price * (Math.random() * volatility * 2 - volatility);
    price += change;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(price, 1).toFixed(2)
    });
  }
  
  return data;
}

// Function to get a stock by symbol
export function getStockBySymbol(symbol: string) {
  // Check popular stocks first
  const stock = popularStocks.find(s => s.symbol === symbol);
  if (stock) return stock;
  
  // Check recommendations
  const recommendation = stockRecommendations.find(s => s.symbol === symbol);
  if (recommendation) {
    return {
      symbol: recommendation.symbol,
      name: recommendation.name,
      exchange: recommendation.exchange,
      price: recommendation.currentPrice,
      change: (recommendation.targetPrice - recommendation.currentPrice) / recommendation.currentPrice * 100,
      direction: recommendation.recommendation === "Buy" ? "up" : "down"
    };
  }
  
  // Check cryptos
  const crypto = cryptoData.find(c => c.symbol === symbol);
  if (crypto) {
    return {
      symbol: crypto.symbol,
      name: crypto.name,
      exchange: "Crypto",
      price: crypto.value,
      change: crypto.change,
      direction: crypto.direction
    };
  }
  
  return null;
}
