import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  CreditCard,
  FileCheck,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  
  // Fetch all users
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['/api/admin/users'],
  });
  
  // Fetch pending KYCs
  const { data: kycData, isLoading: isLoadingKYC, error: kycError } = useQuery({
    queryKey: ['/api/admin/kyc/pending'],
  });
  
  // Fetch pending transactions
  const { data: transactionsData, isLoading: isLoadingTransactions, error: transactionsError } = useQuery({
    queryKey: ['/api/admin/transactions/pending'],
  });
  
  // Show error toasts if any queries fail
  if (usersError || kycError || transactionsError) {
    toast({
      title: "Error",
      description: "Failed to load admin dashboard data",
      variant: "destructive",
    });
  }
  
  // Process data
  const users = usersData?.users || [];
  const pendingKYCs = kycData?.kycs || [];
  const pendingTransactions = transactionsData?.transactions || [];
  
  // Get verification stats
  const verifiedUsers = users.filter(user => user.isVerified).length;
  const unverifiedUsers = users.length - verifiedUsers;
  
  // Get transaction stats
  const depositTransactions = pendingTransactions.filter(t => t.type === "deposit").length;
  const withdrawalTransactions = pendingTransactions.filter(t => t.type === "withdrawal").length;
  
  // Chart data for user stats
  const userStatsData = [
    { name: "Verified", value: verifiedUsers },
    { name: "Unverified", value: unverifiedUsers }
  ];
  
  // Chart data for transaction stats
  const transactionStatsData = [
    { name: "Deposits", count: depositTransactions },
    { name: "Withdrawals", count: withdrawalTransactions }
  ];
  
  // Chart colors
  const COLORS = ["#2563EB", "#F59E0B", "#EF4444", "#10B981"];
  
  // Recent users for display
  const recentUsers = [...users].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);
  
  // Loading state
  if (isLoadingUsers || isLoadingKYC || isLoadingTransactions) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  return (
    <AdminLayout title="Dashboard">
      {/* Admin stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <h3 className="text-3xl font-semibold">{users.length}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending KYC</p>
                <h3 className="text-3xl font-semibold">{pendingKYCs.length}</h3>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Transactions</p>
                <h3 className="text-3xl font-semibold">{pendingTransactions.length}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Verification Rate</p>
                <h3 className="text-3xl font-semibold">
                  {users.length > 0 ? Math.round((verifiedUsers / users.length) * 100) : 0}%
                </h3>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
            <CardDescription>Breakdown of user verification status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userStatsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {userStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transaction Requests</CardTitle>
            <CardDescription>Pending transaction requests by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transactionStatsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563EB" name="Number of Requests" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Users & Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Newly registered users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        {user.isVerified ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Verified
                          </Badge>
                        ) : user.isEmailVerified ? (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            Email Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            Not Verified
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <div className="mt-4 text-right">
              <Button 
                variant="link" 
                className="text-primary" 
                onClick={() => window.location.href = "/admin/users"}
              >
                View All Users <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Action Items</CardTitle>
            <CardDescription>Tasks requiring admin attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <FileCheck className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Pending KYC Verifications</h3>
                    <p className="text-sm text-gray-500">{pendingKYCs.length} verification(s) awaiting review</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = "/admin/kyc"}
                >
                  Review
                </Button>
              </div>
              
              <div className="p-4 border rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Pending Transactions</h3>
                    <p className="text-sm text-gray-500">{pendingTransactions.length} transaction(s) awaiting approval</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = "/admin/transactions"}
                >
                  Review
                </Button>
              </div>
              
              <div className="p-4 border rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Unverified Users</h3>
                    <p className="text-sm text-gray-500">{unverifiedUsers} user(s) without completed KYC</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = "/admin/users"}
                >
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
