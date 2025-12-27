"use client"

import { ProductForm } from "@/components/admin/product-form"

export default function AddProduct() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-xl font-bold mb-6">Add New Product</h1>
      <ProductForm />
    </div>
  )
}