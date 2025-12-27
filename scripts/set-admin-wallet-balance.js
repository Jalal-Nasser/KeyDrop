import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Determine project root reliably, then load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const envLocalPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: false });
} else {
  // Fallback: load standard .env if present
  const envPath = path.join(projectRoot, '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase URL or Service Role Key. Aborting.');
  process.exit(1);
}

const TARGET_BALANCE = 2000.00; // USD

async function run() {
  const client = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log(`Setting wallet_balance to $${TARGET_BALANCE.toFixed(2)} for all admin profiles...`);

  const { data: updated, error } = await client
    .from('profiles')
    .update({ wallet_balance: TARGET_BALANCE })
    .eq('is_admin', true)
    .select('id, wallet_balance');

  if (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }

  if (!updated || updated.length === 0) {
    console.warn('No admin profiles found to update.');
  } else {
    console.log(`Updated ${updated.length} admin profile(s):`);
    updated.forEach(r => console.log(` - ${r.id}: $${Number(r.wallet_balance).toFixed(2)}`));
  }

  // Quick verification query
  const { data: verify, error: verifyError } = await client
    .from('profiles')
    .select('id, wallet_balance')
    .eq('is_admin', true);

  if (verifyError) {
    console.error('Verification query failed:', verifyError);
  } else {
    console.log('Verification result:');
    verify.forEach(r => console.log(` * ${r.id}: $${Number(r.wallet_balance).toFixed(2)}`));
  }

  console.log('Done.');
}

run();
