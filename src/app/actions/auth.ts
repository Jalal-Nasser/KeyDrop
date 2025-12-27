'use server'

import { prisma } from "@/lib/prisma"
import { hash, compare } from "bcrypt"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function changePassword(formData: FormData) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
        throw new Error("Unauthorized")
    }

    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error("All fields are required")
    }

    if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match")
    }

    if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user || !user.password) {
        throw new Error("User not found")
    }

    const isMatch = await compare(currentPassword, user.password)
    if (!isMatch) {
        throw new Error("Incorrect current password")
    }

    const hashedPassword = await hash(newPassword, 10)

    await prisma.user.update({
        where: { email: session.user.email },
        data: { password: hashedPassword }
    })

    return { success: true }
}
