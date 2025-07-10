"use client"

import { StoreNoticeForm } from "@/components/admin/store-notice-form"

export default function AdminStoreNoticePage() {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Manage Store Notice</h1>
      <StoreNoticeForm />
    </div>
  )
}