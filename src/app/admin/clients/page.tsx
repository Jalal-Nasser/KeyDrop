import { prisma } from '@/lib/prisma'
import { Users, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { getGravatarUrl } from '@/lib/gravatar'

export default async function AdminClientsPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { orders: true }
            }
        }
    })

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Clients</h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    <Link href={`/admin/clients/${user.id}`} className="flex items-center gap-2 hover:text-purple-600 transition-colors">
                                        <img
                                            src={user.image || getGravatarUrl(user.email, 40)}
                                            alt=""
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                        />
                                        {user.name || 'N/A'}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                    <Link href={`/admin/clients/${user.id}`} className="flex items-center gap-2 hover:text-purple-600 transition-colors">
                                        <Mail size={16} className="text-gray-400" />
                                        {user.email}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                    {user._count.orders}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="text-center py-10 text-gray-500">No clients found.</div>
                )}
            </div>
        </div>
    )
}
