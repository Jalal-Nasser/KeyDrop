'use client'

import { useState, useEffect } from 'react'
import { createProduct, deleteProduct, getProducts } from '@/app/actions/products'
import { Plus, Trash2, Edit } from 'lucide-react'

type Product = {
    id: string
    name: string
    description: string
    price: number // mapped from Decimal
    stock: number
    image: string | null
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadProducts()
    }, [])

    async function loadProducts() {
        setIsLoading(true)
        const data = await getProducts()
        // Prisma Decimal to number conversion might be needed depending on how it's serialized
        // For now assuming simple serialization or fix server side
        setProducts(data as any)
        setIsLoading(false)
    }

    async function handleSubmit(formData: FormData) {
        await createProduct(formData)
        setIsModalOpen(false)
        loadProducts()
    }

    async function handleDelete(id: string) {
        if (confirm('Are you sure?')) {
            await deleteProduct(id)
            loadProducts()
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Products</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading products...</div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Image</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4">
                                        {product.image && (
                                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">${Number(product.price).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{product.stock}</td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && (
                        <div className="text-center py-10 text-gray-500">No products found. Add one to get started.</div>
                    )}
                </div>
            )}

            {/* Add Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Product</h2>
                        <form action={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Product Name</label>
                                <input name="name" required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                                <textarea name="description" required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Price ($)</label>
                                    <input name="price" type="number" step="0.01" required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Stock</label>
                                    <input name="stock" type="number" required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Image URL</label>
                                <input name="image" placeholder="https://..." className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
