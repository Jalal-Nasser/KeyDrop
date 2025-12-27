'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSettings() {
    let settings = await prisma.settings.findFirst()

    if (!settings) {
        settings = await prisma.settings.create({
            data: {
                storeName: 'Dropskey Store',
                supportEmail: 'support@dropskey.com',
                currency: 'USD',
                taxRate: 0,
            }
        })
    }

    return {
        ...settings,
        taxRate: Number(settings.taxRate)
    }
}

export async function updateSettings(formData: FormData) {
    const storeName = formData.get('storeName') as string
    const supportEmail = formData.get('supportEmail') as string
    const currency = formData.get('currency') as string
    const taxRate = parseFloat(formData.get('taxRate') as string)
    const invoiceFooter = formData.get('invoiceFooter') as string
    const logoUrl = formData.get('logoUrl') as string

    // Update the first record (singleton pattern)
    const settings = await prisma.settings.findFirst()

    if (settings) {
        await prisma.settings.update({
            where: { id: settings.id },
            data: {
                storeName,
                supportEmail,
                currency,
                taxRate, // Prisma handles number -> Decimal automatically
                invoiceFooter,
                logoUrl
            }
        })
    }

    revalidatePath('/admin/settings')
    return { success: true }
}
