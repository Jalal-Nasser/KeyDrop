const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkImages() {
    const products = await prisma.product.findMany({
        take: 5,
        select: { name: true, image: true }
    })
    console.log('Verification Sample:', products)
}

checkImages()
    .finally(() => prisma.$disconnect())
