'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const image = formData.get('image') as string

    await prisma.product.create({
        data: {
            name,
            description,
            price,
            stock,
            image,
        },
    })

    revalidatePath('/admin/products')
}

export async function getProducts() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
    })

    // Convert Decimals to numbers for client components
    return products.map(p => ({
        ...p,
        price: Number(p.price),
        sale_price: (p as any).sale_price ? Number((p as any).sale_price) : null,
        sale_percent: (p as any).sale_percent ? Number((p as any).sale_percent) : null,
    }))
}

export async function deleteProduct(id: string) {
    await prisma.product.delete({
        where: { id },
    })
    revalidatePath('/admin/products')
}

export async function getProduct(id: string) {
    const product = await prisma.product.findUnique({
        where: { id },
    })

    if (!product) return null

    return {
        ...product,
        price: Number(product.price),
        sale_price: (product as any).sale_price ? Number((product as any).sale_price) : null,
        sale_percent: (product as any).sale_percent ? Number((product as any).sale_percent) : null,
    }
}

export async function updateProduct(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const image = formData.get('image') as string

    // Handle optional sale fields if you added them to the schema
    const sale_price = formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null
    const sale_percent = formData.get('sale_percent') ? parseFloat(formData.get('sale_percent') as string) : null

    await prisma.product.update({
        where: { id },
        data: {
            name,
            description,
            price,
            stock,
            image,
            // @ts-ignore
            sale_price: sale_price,
            // @ts-ignore
            sale_percent: sale_percent
        },
    })

    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${id}`)
}
