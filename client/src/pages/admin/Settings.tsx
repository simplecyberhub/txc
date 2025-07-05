import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminSettings from "@/components/admin/AdminSettings";

export default function Settings() {
  return (
    <AdminLayout title="System Settings">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">
          Configure global settings for the TradeXCapital platform
        </p>
      </div>
      
      <AdminSettings />
    </AdminLayout>
  );
}
