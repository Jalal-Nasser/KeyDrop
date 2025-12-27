const { createClient } = require('@supabase/supabase-js')

// Credentials from user
const SUPABASE_URL = 'https://notncpmpmgostfxesrvk.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function inspect() {
    console.log('Connecting to Supabase...')

    // Try 'products' table first
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error fetching products:', error.message)
        // Try 'Product' with capital P just in case
        const { data: Products, error: err2 } = await supabase
            .from('Product')
            .select('*')
            .limit(1)

        if (err2) {
            console.log('Also failed to fetch from "Product":', err2.message)
        } else {
            console.log('Found "Product" table. Sample:', Products[0])
        }
    } else {
        console.log('Found "products" table. Sample:', products[0])
    }
}

inspect()
