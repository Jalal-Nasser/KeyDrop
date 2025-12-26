'use client'

import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus } from '@/app/actions/orders'
import { Package, Truck, CheckCircle, Clock } from 'lucide-react'

type Order = {
    id: string
    status: string
    total: number // Decimal mapped
    createdAt: Date
    user: { name: string | null; email: string } | null
    items: any[]
    paypalOrderId: string | null
}

const statusColors: any = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadOrders()
    }, [])

    async function loadOrders() {
        setIsLoading(true)
        const data = await getOrders()
        setOrders(data as any)
        setIsLoading(false)
    }

    async function handleStatusChange(orderId: string, newStatus: string) {
        await updateOrderStatus(orderId, newStatus)
        loadOrders()
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Orders</h1>

            {isLoading ? (
                <div className="text-center py-10">Loading orders...</div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">PayPal ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-500">#{order.id.slice(-6)}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{order.user?.name || 'Guest'}</div>
                                        <div className="text-sm text-gray-500">{order.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${statusColors[order.status] || 'bg-gray-100'}`}
                                        >
                                            <option value="PENDING">PENDING</option>
                                            <option value="PAID">PAID</option>
                                            <option value="SHIPPED">SHIPPED</option>
                                            <option value="COMPLETED">COMPLETED</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        ${Number(order.total).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                        {order.paypalOrderId || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="text-center py-10 text-gray-500">No orders found.</div>
                    )}
                </div>
            )}
        </div>
    )
}
