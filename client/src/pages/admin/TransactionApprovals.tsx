import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import WalletTransactions from "@/components/admin/WalletTransactions";

export default function TransactionApprovals() {
  return (
    <AdminLayout title="Transaction Approvals">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
        <p className="text-gray-600">
          Review and approve deposit and withdrawal requests
        </p>
      </div>
      
      <WalletTransactions />
    </AdminLayout>
  );
}
