import { getUserProfile } from "@/app/actions/clients";
import { redirect } from "next/navigation";
import { ArrowLeft, User, Mail, Calendar, DollarSign, Package, Clock, Shield } from "lucide-react";
import Link from "next/link";
import { getGravatarUrl } from "@/lib/gravatar";
import { DeleteClientButton } from "@/app/admin/clients/[id]/DeleteClientButton";

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await getUserProfile(id);

    if (!client) {
        redirect("/admin/clients");
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/clients" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <ArrowLeft className="text-gray-500" size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Client Profile</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Details and history for <span className="font-medium text-gray-900 dark:text-white">{client.name || 'Guest User'}</span></p>
                    </div>
                </div>
                <DeleteClientButton userId={client.id} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Client Info Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 text-center border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-gray-800 shadow-sm overflow-hidden">
                                <img
                                    src={client.image || getGravatarUrl(client.email)}
                                    alt={client.name || 'Client'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{client.name || 'No Name Provided'}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mt-1">
                                <span className={`w-2 h-2 rounded-full ${client.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                {client.role.toUpperCase()}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500">
                                    <Mail size={16} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Email Address</p>
                                    <p className="font-medium text-gray-900 dark:text-white break-all">{client.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500">
                                    <Calendar size={16} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Joined Date</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{new Date(client.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500">
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Account ID</p>
                                    <p className="font-mono text-xs text-gray-500 truncate w-40" title={client.id}>
                                        {client.displayId || client.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="text-emerald-600 bg-emerald-100/50 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
                                <DollarSign size={16} />
                            </div>
                            <p className="text-xs text-gray-500">Total Spent</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">${client.totalSpent.toFixed(2)}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="text-blue-600 bg-blue-100/50 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
                                <Package size={16} />
                            </div>
                            <p className="text-xs text-gray-500">Total Orders</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{client.orders.length}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order History */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white">Transaction History</h3>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-1 rounded-full">
                                Latest 10
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Items</th>
                                        <th className="px-6 py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {client.orders.map((order: any) => {
                                        const statusColor = order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';
                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                    #{order.id.slice(-8).toUpperCase()}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} className="text-gray-400" />
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        {order.items.map((item: any) => (
                                                            <span key={item.id} className="text-xs text-gray-600 dark:text-gray-300">
                                                                {item.quantity}x {item.product.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                                                    ${order.total.toFixed(2)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {client.orders.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-gray-500">
                                                No transactions found for this client.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
