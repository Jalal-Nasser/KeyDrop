'use server'

import { prisma } from '@/lib/prisma'

export async function getUserProfile(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            orders: {
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            },
            _count: {
                select: { orders: true }
            }
        }
    })

    if (!user) return null

    // Calculate generic stats
    const totalSpent = user.orders.reduce((sum, order) => {
        return sum + Number(order.total)
    }, 0)

    const lastActive = user.orders.length > 0 ? user.orders[0].createdAt : user.createdAt

    return {
        ...user,
        totalSpent,
        lastActive,
        orders: user.orders.map(order => ({
            ...order,
            total: Number(order.total),
            items: order.items.map(item => ({
                ...item,
                price: Number(item.price)
            }))
        }))
    }
}

export async function deleteUser(userId: string) {
    try {
        // 1. Find all orders
        const orders = await prisma.order.findMany({
            where: { userId },
            select: { id: true }
        })

        const orderIds = orders.map(o => o.id)

        // 2. Delete all OrderItems for these orders
        if (orderIds.length > 0) {
            await prisma.orderItem.deleteMany({
                where: { orderId: { in: orderIds } }
            })

            // 3. Delete all Orders
            await prisma.order.deleteMany({
                where: { id: { in: orderIds } }
            })
        }

        // 4. Delete the User
        await prisma.user.delete({
            where: { id: userId }
        })

        return { success: true }
    } catch (error) {
        console.error('Failed to delete user:', error)
        return { success: false, error }
    }
}
