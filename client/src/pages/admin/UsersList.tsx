import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import UserManagement from "@/components/admin/UserManagement";

export default function UsersList() {
  return (
    <AdminLayout title="Users Management">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">
          View and manage all users on the TradeXCapital platform
        </p>
      </div>
      
      <UserManagement />
    </AdminLayout>
  );
}
