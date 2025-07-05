import MainLayout from "@/components/layouts/MainLayout";
import AccountSummary from "@/components/dashboard/AccountSummary";
import MarketOverview from "@/components/dashboard/MarketOverview";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import Watchlist from "@/components/dashboard/Watchlist";
import TradingRecommendations from "@/components/dashboard/TradingRecommendations";
import { useState } from "react";
import React from "react";

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <pre className="whitespace-pre-wrap">{error.message}</pre>
      </div>
    );
  }
  return (
    <ErrorCatcher onError={setError}>{children}</ErrorCatcher>
  );
}

class ErrorCatcher extends React.Component<{ onError: (e: Error) => void; children: React.ReactNode }> {
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    return this.props.children;
  }
}

export default function Dashboard() {
  return (
    <MainLayout title="Dashboard">
      <ErrorBoundary>
        {/* Account Summary */}
        <AccountSummary />
        
        {/* Market Overview */}
        <MarketOverview />
        
        {/* Recent Transactions & Watchlist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>
          <div>
            <Watchlist />
          </div>
        </div>
        
        {/* Trading Recommendations */}
        <TradingRecommendations />
      </ErrorBoundary>
    </MainLayout>
  );
}
