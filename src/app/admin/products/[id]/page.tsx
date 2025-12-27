import { prisma } from "@/lib/prisma";
import { getProduct, updateProduct } from "@/app/actions/products";
import { redirect } from "next/navigation";
import { Save, ArrowLeft, Package, DollarSign, Image as ImageIcon, FileText, Layers } from "lucide-react";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        redirect("/admin/products");
    }

    async function updateProductAction(formData: FormData) {
        "use server";
        await updateProduct(id, formData);
        redirect("/admin/products");
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-fade-in-up">
            <div className="flex items-center space-x-4">
                <a href="/admin/products" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <ArrowLeft className="text-gray-500" size={24} />
                </a>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Edit Product</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Update details for <span className="font-medium text-gray-900 dark:text-white">{product.name}</span></p>
                </div>
            </div>

            <form action={updateProductAction} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Core Details */}
                    <div className="md:col-span-2 space-y-8">
                        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                    <Package size={20} />
                                </div>
                                <h2 className="font-semibold text-gray-900 dark:text-white">Product Information</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        defaultValue={product.name}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                    <textarea
                                        name="description"
                                        defaultValue={product.description || ''}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                    <ImageIcon size={20} />
                                </div>
                                <h2 className="font-semibold text-gray-900 dark:text-white">Media</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                                    <input
                                        name="image"
                                        type="text"
                                        defaultValue={product.image || ''}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Pricing & Inventory */}
                    <div className="space-y-8">
                        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                    <DollarSign size={20} />
                                </div>
                                <h2 className="font-semibold text-gray-900 dark:text-white">Pricing</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        defaultValue={product.price}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sale Price (Optional)</label>
                                    <input
                                        name="sale_price"
                                        type="number"
                                        step="0.01"
                                        defaultValue={product.sale_price || ''}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                                    <Layers size={20} />
                                </div>
                                <h2 className="font-semibold text-gray-900 dark:text-white">Inventory</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock Count</label>
                                    <input
                                        name="stock"
                                        type="number"
                                        defaultValue={product.stock}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3 rounded-xl shadow-lg shadow-purple-500/30 flex items-center transition-all transform hover:-translate-y-0.5"
                    >
                        <Save size={20} className="mr-2" />
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
