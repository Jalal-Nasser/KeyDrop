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
    return await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export async function deleteProduct(id: string) {
    await prisma.product.delete({
        where: { id },
    })
    revalidatePath('/admin/products')
}
