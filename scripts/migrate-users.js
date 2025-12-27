const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

// Hardcoded creds from previous successful scripts
const SUPABASE_URL = 'https://notncpmpmgostfxesrvk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const prisma = new PrismaClient();

async function migrateUsers() {
    console.log('Fetching profiles from Supabase...');
    const { data: profiles, error } = await supabase.from('profiles').select('*');

    if (error) {
        console.error('Error fetching Supabase profiles:', error.message);
        process.exit(1);
    }

    console.log(`Found ${profiles.length} profiles. Migrating to Neon...`);

    let successCount = 0;
    let failCount = 0;

    for (const p of profiles) {
        try {
            const name = `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email.split('@')[0];
            const role = p.is_admin ? 'admin' : 'customer';

            // Upsert user by unique email
            await prisma.user.upsert({
                where: { email: p.email },
                update: {
                    name,
                    role, // Update role if changed
                },
                create: {
                    email: p.email,
                    name,
                    role,
                    password: null, // No password for migrated users (they must use Google or reset)
                }
            });

            console.log(`Migrated: ${p.email} (${role})`);
            successCount++;
        } catch (e) {
            console.error(`Failed to migrate ${p.email}:`, e.message);
            failCount++;
        }
    }

    console.log('\nMigration Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
}

migrateUsers()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
