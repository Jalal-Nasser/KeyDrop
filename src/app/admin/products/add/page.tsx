"use client"

export default function AddProduct() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-xl font-bold mb-6">Add New Product</h1>
      {/* Product add form will go here */}
      <form className="space-y-4">
        <input type="text" placeholder="Product Name" className="w-full border px-3 py-2 rounded" />
        <input type="number" placeholder="Price" className="w-full border px-3 py-2 rounded" />
        <textarea placeholder="Description" className="w-full border px-3 py-2 rounded" />
        <input type="file" className="w-full" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Product</button>
      </form>
    </div>
  )
}
