const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')

const SUPABASE_URL = 'https://notncpmpmgostfxesrvk.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const prisma = new PrismaClient()

async function fixImages() {
    console.log('Fetching products from Supabase to fix images...')
    const { data: products, error } = await supabase.from('products').select('*')

    if (error) {
        console.error('Error:', error.message)
        return
    }

    if (products.length > 0) {
        console.log('Sample product keys:', Object.keys(products[0]))
    }

    let updatedCount = 0

    for (const p of products) {
        // Try to find the image URL in common fields
        const imageUrl = p.image_url || p.image || p.img || p.url

        if (imageUrl) {
            try {
                const result = await prisma.product.updateMany({
                    where: { name: p.name },
                    data: { image: imageUrl }
                })
                if (result.count > 0) {
                    console.log(`Updated image for: "${p.name}"`)
                    updatedCount++
                }
            } catch (e) {
                console.error(`Failed to update ${p.name}:`, e.message)
            }
        } else {
            console.log(`No image found in Supabase for: "${p.name}"`)
        }
    }

    console.log(`\nFixed ${updatedCount} product images.`)
}

fixImages()
    .finally(() => prisma.$disconnect())
