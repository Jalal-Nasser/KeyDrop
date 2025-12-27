import { prisma } from "@/lib/prisma";
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import { DashboardCharts } from "./DashboardCharts";
import Link from "next/link";

async function getStats() {
    const [orderCount, productCount, userCount, revenueData, orders, pendingOrders] = await Promise.all([
        prisma.order.count(),
        prisma.product.count(),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.order.aggregate({
            _sum: { total: true },
            where: { status: "PAID" }
        }),
        prisma.order.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        }),
        // Fetch REAL pending orders
        prisma.order.findMany({
            where: { status: 'PENDING' },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        })
    ]);

    const totalRevenue = Number(revenueData._sum.total) || 0;

    // Process data for charts
    const revenueByDay: Record<string, number> = {};
    orders.forEach((order: any) => {
        const date = order.createdAt.toISOString().split('T')[0];
        revenueByDay[date] = (revenueByDay[date] || 0) + Number(order.total);
    });

    const chartRevenueData = Object.keys(revenueByDay).map(date => ({
        name: date,
        total: revenueByDay[date]
    })).slice(-7);

    const statusGroups = await prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
    });

    const chartStatusData = statusGroups.map((group: any) => ({
        name: group.status,
        value: group._count.status
    }));

    return {
        orderCount,
        productCount,
        userCount,
        totalRevenue,
        chartRevenueData,
        chartStatusData,
        recentOrders: orders,
        pendingOrders
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Control Center</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your billing and store performance.</p>
                </div>
                <div className="flex space-x-3">
                    <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        System Operational
                    </div>
                </div>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toFixed(2)}`}
                    icon={DollarSign}
                    color="text-emerald-600"
                    bgColor="bg-emerald-100/50"
                    trend="+12.5% vs last mo"
                />
                <MetricCard
                    title="Active Orders"
                    value={stats.orderCount.toString()}
                    icon={ShoppingBag}
                    color="text-blue-600"
                    bgColor="bg-blue-100/50"
                    trend="+5 new today"
                />
                <MetricCard
                    title="Total Clients"
                    value={stats.userCount.toString()}
                    icon={Users}
                    color="text-purple-600"
                    bgColor="bg-purple-100/50"
                    trend="Active now: 2"
                />
                <MetricCard
                    title="Products"
                    value={stats.productCount.toString()}
                    icon={Package}
                    color="text-orange-600"
                    bgColor="bg-orange-100/50"
                    trend="Stock healthy"
                />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <DashboardCharts revenueData={stats.chartRevenueData} statusData={stats.chartStatusData} />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[400px]">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Pending Actions</h3>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">{stats.pendingOrders.length} Pending</span>
                    </div>
                    <div className="p-6 overflow-y-auto space-y-4 flex-1">
                        {stats.pendingOrders.map((order: any) => (
                            <Link href={`/admin/orders`} key={order.id} className="block group">
                                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors cursor-pointer">
                                    <AlertCircle className="text-yellow-500 mt-1 flex-shrink-0" size={18} />
                                    <div>
                                        <p className="text-sm font-medium dark:text-white group-hover:text-purple-600 transition-colors">Order #{order.id.slice(0, 8)}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 relative z-20">
                                            Client:
                                            {order.user ? (
                                                <Link href={`/admin/clients/${order.userId}`} className="hover:text-purple-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                                    {order.user.email}
                                                </Link>
                                            ) : 'Guest'}
                                            • ${Number(order.total).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {stats.pendingOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <p className="text-gray-400 text-sm">No pending actions.</p>
                                <p className="text-gray-400 text-xs">You're all caught up!</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                        <Link href="/admin/orders" className="block w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg transition-colors text-center">
                            Manage All Orders
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Transactions</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Latest financial activity from your store.</p>
                    </div>
                    <Link href="/admin/orders" className="text-xs flex items-center text-purple-600 hover:text-purple-700 font-medium">
                        View All <ArrowRight size={14} className="ml-1" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-right">Date</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {stats.recentOrders.map((order: any) => {
                                const statusColor = order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            <Link href={`/admin/orders`} className="hover:text-purple-600 underline decoration-dotted">
                                                #{order.id.slice(-8).toUpperCase()}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 font-medium dark:text-gray-200">
                                            {order.user ? (
                                                <Link href={`/admin/clients/${order.userId}`} className="hover:text-purple-600 hover:underline">
                                                    {order.user.email}
                                                </Link>
                                            ) : 'Guest'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">${Number(order.total).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href="/admin/orders" className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Manage</Link>
                                        </td>
                                    </tr>
                                )
                            })}
                            {stats.recentOrders.length === 0 && (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No transactions yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, color, bgColor, trend }: any) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-32 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-2xl font-bold dark:text-white mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${bgColor}`}>
                    <Icon className={color} size={20} />
                </div>
            </div>
            <div className="flex items-center text-xs font-medium text-emerald-600 mt-2">
                <TrendingUp size={14} className="mr-1" />
                {trend}
            </div>
        </div>
    )
}
