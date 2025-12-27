
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Starting backfill...')

    // 1. Backfill Display IDs
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { displayId: null },
                { displayId: '' }
            ]
        }
    })

    console.log(`Found ${users.length} users needing IDs.`)

    for (const user of users) {
        // Generate a random 6-digit ID
        let unique = false;
        let displayId = '';

        while (!unique) {
            const num = Math.floor(100000 + Math.random() * 900000);
            displayId = `DRP-${num}`; // e.g. DRP-123456

            const existing = await prisma.user.findUnique({ where: { displayId } });
            if (!existing) unique = true;
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { displayId }
        })
        console.log(`Generated ID for ${user.email}: ${displayId}`)
    }

    console.log('Backfill complete.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
