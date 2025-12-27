const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')

const SUPABASE_URL = 'https://notncpmpmgostfxesrvk.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const prisma = new PrismaClient()

async function migrate() {
    console.log('Fetching products from Supabase...')
    const { data: products, error } = await supabase.from('products').select('*')

    if (error) {
        console.error('Error fetching Supabase products:', error.message)
        process.exit(1)
    }

    console.log(`Found ${products.length} products. Beginning migration to Neon...`)

    let successCount = 0
    let skipCount = 0

    for (const p of products) {
        try {
            // Check for duplicate by name
            const existing = await prisma.product.findFirst({
                where: { name: p.name }
            })

            if (existing) {
                console.log(`Skipping: "${p.name}" (Already exists)`)
                skipCount++
                continue
            }

            await prisma.product.create({
                data: {
                    name: p.name,
                    description: p.description || '',
                    price: p.price || 0,
                    image: p.image_url || null,
                    stock: 100, // Default stock for migrated items
                }
            })
            console.log(`Created: "${p.name}"`)
            successCount++
        } catch (e) {
            console.error(`Failed to migrate "${p.name}":`, e.message)
        }
    }

    console.log('\nMigration Complete!')
    console.log(`Successfully migrated: ${successCount}`)
    console.log(`Skipped (duplicates): ${skipCount}`)
}

migrate()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
