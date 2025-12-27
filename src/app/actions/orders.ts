'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getOrders() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: true,
            items: {
                include: { product: true }
            }
        }
    })

    // Convert Decimals to numbers
    return orders.map((order: any) => ({
        ...order,
        total: Number(order.total),
        items: order.items.map((item: any) => ({
            ...item,
            price: Number(item.price),
            product: {
                ...item.product,
                price: Number(item.product.price),
                sale_price: (item.product as any).sale_price ? Number((item.product as any).sale_price) : null,
                sale_percent: (item.product as any).sale_percent ? Number((item.product as any).sale_percent) : null,
            }
        }))
    }))
}

import { sendOrderStatusEmail } from '@/lib/email'

export async function updateOrderStatus(orderId: string, status: string) {
    // 1. Update the status
    const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: { user: true } // Fetch user email
    })

    // 2. Send email notification
    if (order.user && order.user.email) {
        // Run in background (don't await to keep UI fast)
        sendOrderStatusEmail(order.user.email, orderId, status)
            .catch(err => console.error('Background email failed:', err))
    }

    revalidatePath('/admin/orders')
}

import { sendLicenseKeyEmail } from '@/lib/email'

export async function fulfillOrderItem(orderItemId: string, licenseKey: string) {
    // 1. Update the order item
    const item = await prisma.orderItem.update({
        where: { id: orderItemId },
        data: {
            licenseKey,
            isFulfilled: true
        },
        include: {
            order: {
                include: { user: true }
            },
            product: true
        }
    })

    // 2. Send email with key
    const email = item.order.customerEmail || item.order.user?.email
    if (email) {
        sendLicenseKeyEmail(email, item.product.name, licenseKey)
            .catch(err => console.error('Background license email failed:', err))
    }

    // 3. Check if all items in the order are fulfilled
    const orderItems = await prisma.orderItem.findMany({
        where: { orderId: item.orderId }
    })

    const allFulfilled = orderItems.every((i: any) => i.isFulfilled)

    if (allFulfilled) {
        await prisma.order.update({
            where: { id: item.orderId },
            data: { status: 'COMPLETED' }
        })
    }

    revalidatePath('/admin/orders')
    return { success: true }
}
