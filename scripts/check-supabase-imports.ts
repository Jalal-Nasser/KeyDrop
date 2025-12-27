#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const SUPABASE_CLIENT_PATH = path.normalize('@/lib/supabase/client');
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/*.d.ts',
  '**/check-supabase-imports.ts',
];

// Patterns to detect Supabase client imports
const CLIENT_IMPORT_PATTERNS = [
  // Direct imports from @supabase/supabase-js
  /import\s*{[^}]*\bcreateClient\b[^}]*}\s*from\s*['"]@supabase\/supabase-js['"]/,
  // Import with default import
  /import\s+\w+\s+from\s*['"]@supabase\/supabase-js['"]/,
  // Dynamic imports
  /import\s*\(\s*['"]@supabase\/supabase-js['"]\s*\)/,
  // Require statements
  /const\s+\{\s*[^}]*\bcreateClient\b[^}]*\}\s*=\s*require\s*\(\s*['"]@supabase\/supabase-js['"]\s*\)/,
];

async function checkFiles() {
  console.log('🔍 Checking for direct Supabase client imports...');
  
  // Find all TypeScript and JavaScript files
  const files = await glob('**/*.{ts,tsx,js,jsx}', { 
    cwd: SRC_DIR, 
    ignore: IGNORE_PATTERNS,
    absolute: true 
  });

  let hasIssues = false;
  const results = [];

  for (const file of files) {
    const content = await fs.promises.readFile(file, 'utf-8');
    const relativePath = path.relative(ROOT_DIR, file);
    
    // Skip files that are already using the correct import
    if (content.includes(SUPABASE_CLIENT_PATH)) {
      continue;
    }

    // Check for direct Supabase client imports
    const hasDirectImport = CLIENT_IMPORT_PATTERNS.some(pattern => 
      pattern.test(content)
    );

    if (hasDirectImport) {
      hasIssues = true;
      results.push({
        file: relativePath,
        message: 'Direct Supabase client import detected. Use the client from @/lib/supabase/client instead.'
      });
    }
  }

  // Print results
  if (results.length > 0) {
    console.log('🚨 Found potential issues:');
    results.forEach(({ file, message }) => {
      console.log(`\n${file}:`);
      console.log(`  ${message}`);
    });
    
    console.log('\n💡 Recommendation:');
    console.log('  Replace direct @supabase/supabase-js imports with:');
    console.log(`  import { supabase } from '${SUPABASE_CLIENT_PATH}';`);
    console.log('\n  Or for server components:');
    console.log(`  import { getSupabaseServerClient } from '@/lib/supabase/server';`);
    
    process.exit(1);
  } else {
    console.log('✅ No direct Supabase client imports found.');
    process.exit(0);
  }
}

// Run the check
checkFiles().catch(error => {
  console.error('Error checking files:', error);
  process.exit(1);
});
