const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env specific to local (includes Supabase creds if they are there)
// We might need to check .env.local or just .env
const SUPABASE_URL = 'https://notncpmpmgostfxesrvk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectTables() {
    console.log('Connecting to Supabase...');

    // There isn't a direct "list tables" in JS client easily without SQL usually, 
    // but we can try to generic select from likely tables or use a known hack if we had permissions.
    // However, usually we can just inspect a few standard names.

    const candidates = ['users', 'profiles', 'clients', 'customers', 'auth.users'];

    for (const table of candidates) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (!error) {
                console.log(`✅ Table found: "${table}" (Rows: ${data.length > 0 ? 'Yes' : 'Empty'})`);
                if (data.length > 0) console.log('Sample:', data[0]);
            } else {
                console.log(`❌ Table access failed: "${table}" - ${error.message}`);
            }
        } catch (err) {
            console.log(`❌ Error checking "${table}":`, err.message);
        }
    }
}

inspectTables();
