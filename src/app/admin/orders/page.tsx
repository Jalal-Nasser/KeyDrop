'use client'

import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus, fulfillOrderItem } from '@/app/actions/orders'
import { Package, Truck, CheckCircle, Clock, FileText, Download, Key, ChevronDown, ChevronUp, Send } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Order Types
type OrderItem = {
    id: string
    price: number
    quantity: number
    licenseKey?: string | null
    isFulfilled: boolean
    product: { name: string }
}

type Order = {
    id: string
    createdAt: Date
    status: string
    total: number
    customerEmail?: string | null
    user: { email: string } | null
    items: OrderItem[]
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
    const [fulfillingItem, setFulfillingItem] = useState<OrderItem | null>(null)
    const [licenseKeyInput, setLicenseKeyInput] = useState('')

    useEffect(() => {
        loadOrders()
    }, [])

    async function loadOrders() {
        try {
            const data = await getOrders()
            // @ts-ignore
            setOrders(data)
        } catch (error) {
            console.error('Failed to load orders', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleStatusChange(id: string, newStatus: string) {
        await updateOrderStatus(id, newStatus)
        loadOrders() // Refresh UI
    }

    const toggleExpand = (orderId: string) => {
        const newExpanded = new Set(expandedOrders)
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId)
        } else {
            newExpanded.add(orderId)
        }
        setExpandedOrders(newExpanded)
    }

    const openFulfillModal = (item: OrderItem) => {
        setFulfillingItem(item)
        setLicenseKeyInput('')
    }

    const closeFulfillModal = () => {
        setFulfillingItem(null)
        setLicenseKeyInput('')
    }

    const submitFulfillment = async () => {
        if (!fulfillingItem || !licenseKeyInput) return

        try {
            await fulfillOrderItem(fulfillingItem.id, licenseKeyInput)
            closeFulfillModal()
            loadOrders() // Refresh to show updated status
            alert('License key sent successfully!')
        } catch (error) {
            console.error('Fulfillment failed', error)
            alert('Failed to send license key. Please try again.')
        }
    }

    const generateInvoice = (order: Order) => {
        const doc = new jsPDF()
        const userEmail = order.customerEmail || order.user?.email || 'Guest'

        // Header
        doc.setFontSize(22)
        doc.text('INVOICE', 14, 20)

        doc.setFontSize(10)
        doc.text('Dropskey Store', 14, 30)
        doc.text('support@dropskey.com', 14, 35)

        // Order Details
        doc.text(`Invoice #: INV-${order.id.slice(0, 8).toUpperCase()}`, 140, 30)
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 35)
        doc.text(`Billed To: ${userEmail}`, 14, 50)

        // Table
        const tableData = order.items.map(item => [
            item.product.name,
            item.quantity.toString(),
            `$${item.price.toFixed(2)}`,
            `$${(item.price * item.quantity).toFixed(2)}`
        ])

        autoTable(doc, {
            startY: 60,
            head: [['Item', 'Qty', 'Unit Price', 'Total']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] } // Indigo-600
        })

        // Total
        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY || 60
        doc.setFontSize(12)
        doc.text(`Total Due: $${order.total.toFixed(2)}`, 140, finalY + 15)

        // Footer
        doc.setFontSize(10)
        doc.setTextColor(150)
        doc.text('Thank you for your business!', 14, 280)

        doc.save(`invoice-${order.id}.pdf`)
    }


    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        PAID: 'bg-green-100 text-green-800',
        SHIPPED: 'bg-blue-100 text-blue-800',
        COMPLETED: 'bg-purple-100 text-purple-800',
        CANCELLED: 'bg-red-100 text-red-800',
    }

    const statusIcons = {
        PENDING: Clock,
        PAID: CheckCircle,
        SHIPPED: Truck,
        COMPLETED: Package,
        CANCELLED: FileText
    }

    if (loading) return <div>Loading orders...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold dark:text-white">Order Management</h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Order ID</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Customer</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Total</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {orders.map((order) => {
                            // @ts-ignore
                            const Icon = statusIcons[order.status] || FileText
                            // @ts-ignore
                            const statusColor = statusColors[order.status] || 'bg-gray-100'
                            const isExpanded = expandedOrders.has(order.id)
                            const userEmail = order.customerEmail || order.user?.email || 'Guest'

                            return (
                                <>
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium dark:text-gray-300">
                                            <button
                                                onClick={() => toggleExpand(order.id)}
                                                className="flex items-center gap-2 hover:text-purple-600"
                                            >
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                #{order.id.slice(-6).toUpperCase()}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium dark:text-white">{userEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                            ${order.total.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                                                <Icon size={12} className="mr-1" />
                                                {order.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-sm rounded px-2 py-1 outline-none focus:border-purple-500"
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="PAID">Paid</option>
                                                    <option value="SHIPPED">Shipped</option>
                                                    <option value="COMPLETED">Completed</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>

                                                <button
                                                    onClick={() => generateInvoice(order)}
                                                    className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                                                    title="Download Invoice"
                                                >
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                                            <td colSpan={6} className="px-6 py-4">
                                                <div className="space-y-3">
                                                    <p className="text-xs font-semibold uppercase text-gray-500">Order Items</p>
                                                    {order.items.map(item => (
                                                        <div key={item.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                                                                    <Package size={20} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                                                                    <p className="text-xs text-gray-500">Qty: {item.quantity} • ${item.price.toFixed(2)}</p>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                {item.isFulfilled ? (
                                                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium">
                                                                        <CheckCircle size={16} />
                                                                        <span>Fulfilled</span>
                                                                        <span className="text-xs text-gray-400 ml-1 font-mono hidden md:inline">
                                                                            ({item.licenseKey?.slice(0, 8)}...)
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => openFulfillModal(item)}
                                                                        className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                                                    >
                                                                        <Key size={16} />
                                                                        Send Code
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )
                        })}
                    </tbody>
                </table>

                {orders.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No orders found.</div>
                )}
            </div>

            {/* Fulfill Item Modal */}
            {fulfillingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fulfill Item</h2>
                                <p className="text-sm text-gray-500 mt-1">Sending key for: <span className="font-semibold">{fulfillingItem.product.name}</span></p>
                            </div>
                            <button onClick={closeFulfillModal} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Product Key / License Code
                                </label>
                                <textarea
                                    value={licenseKeyInput}
                                    onChange={(e) => setLicenseKeyInput(e.target.value)}
                                    placeholder="Paste the product key here..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white font-mono text-sm"
                                    rows={4}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    This key will be emailed to the customer immediately.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={closeFulfillModal}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitFulfillment}
                                    disabled={!licenseKeyInput.trim()}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-medium shadow-lg shadow-gray-200/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                                >
                                    <Send size={16} />
                                    Send Key
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
