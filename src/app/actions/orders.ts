'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getOrders() {
    return await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: true,
            items: {
                include: { product: true }
            }
        }
    })
}

export async function updateOrderStatus(orderId: string, status: string) {
    await prisma.order.update({
        where: { id: orderId },
        data: { status },
    })
    revalidatePath('/admin/orders')
}
