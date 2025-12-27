
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Fetching recent orders...')
    const orders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    })

    console.log('Found', orders.length, 'orders')
    orders.forEach(o => {
        console.log({
            id: o.id,
            total: o.total,
            status: o.status,
            userId: o.userId,
            userEmail: o.user ? o.user.email : 'N/A',
            customerEmail: o.customerEmail,
            paypalOrderId: o.paypalOrderId,
            createdAt: o.createdAt
        })
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
