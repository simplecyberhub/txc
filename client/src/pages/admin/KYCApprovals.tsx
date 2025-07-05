import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import KYCVerification from "@/components/admin/KYCVerification";

export default function KYCApprovals() {
  return (
    <AdminLayout title="KYC Verifications">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">KYC Verification Management</h1>
        <p className="text-gray-600">
          Review and approve user identity verification requests
        </p>
      </div>
      
      <KYCVerification />
    </AdminLayout>
  );
}
