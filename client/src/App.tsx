import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import VerifyEmail from "@/pages/VerifyEmail";
import KYCVerification from "@/pages/KYCVerification";
import Markets from "@/pages/Markets";
import Trade from "@/pages/Trade";
import Portfolio from "@/pages/Portfolio";
import CopyTrading from "@/pages/CopyTrading";
import Wallet from "@/pages/Wallet";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UsersList from "@/pages/admin/UsersList";
import KYCApprovals from "@/pages/admin/KYCApprovals";
import TransactionApprovals from "@/pages/admin/TransactionApprovals";
import ContentManagement from "@/pages/admin/ContentManagement";
import Settings from "@/pages/admin/Settings";
import { AuthProvider } from "@/lib/auth";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-email" component={VerifyEmail} />

      {/* User routes */}
      <Route path="/" component={Dashboard} />
      <Route path="/kyc" component={KYCVerification} />
      <Route path="/markets" component={Markets} />
      <Route path="/trade" component={Trade} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/copy-trading" component={CopyTrading} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/profile" component={Profile} />

      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={UsersList} />
      <Route path="/admin/kyc" component={KYCApprovals} />
      <Route path="/admin/transactions" component={TransactionApprovals} />
      <Route path="/admin/content" component={ContentManagement} />
      <Route path="/admin/settings" component={Settings} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
