import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const SOURCE_DIRS = ['src', 'app', 'components', 'lib', 'pages'];
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/build/**',
  '**/dist/**',
  '**/*.d.ts',
];

// Track case-sensitive paths
const pathMap = new Map<string, string>();
const caseConflicts: string[] = [];

/**
 * Check if a file exists with case sensitivity
 */
function existsCaseSensitive(filePath: string): boolean {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  
  try {
    const files = fs.readdirSync(dir);
    return files.some(f => f === base);
  } catch (e) {
    return false;
  }
}

/**
 * Check a single file for case sensitivity issues
 */
function checkFileCase(filePath: string): void {
  const normalizedPath = filePath.toLowerCase();
  const existingPath = pathMap.get(normalizedPath);
  
  if (existingPath && existingPath !== filePath) {
    caseConflicts.push(`Case conflict: "${filePath}" vs "${existingPath}"`);
  } else {
    pathMap.set(normalizedPath, filePath);
  }
}

/**
 * Main function to check the project for case sensitivity issues
 */
async function main() {
  console.log('🔍 Checking for case sensitivity issues...\n');
  
  try {
    // Get all files in source directories using callback-based glob
    const files: string[] = [];
    
    for (const dir of SOURCE_DIRS) {
      const pattern = path.join(dir, '**/*');
      const matches = await glob(pattern, { 
        cwd: PROJECT_ROOT,
        ignore: IGNORE_PATTERNS,
        absolute: true,
        nodir: true
      });
      
      files.push(...matches);
    }
    
    // Check each file
    files.forEach(file => {
      checkFileCase(file);
      
      // Check if the file exists with exact case
      if (!existsCaseSensitive(file)) {
        caseConflicts.push(`Case mismatch: "${file}"`);
      }
    });
    
    // Report results
    if (caseConflicts.length > 0) {
      console.log('🚨 Found case sensitivity issues:');
      caseConflicts.forEach(conflict => console.log(`- ${conflict}`));
      console.log('\n💡 Please fix these case sensitivity issues to ensure compatibility with case-sensitive file systems.');
      process.exit(1);
    } else {
      console.log('✅ No case sensitivity issues found!');
    }
  } catch (error) {
    console.error('Error checking case sensitivity:', error);
    process.exit(1);
  }
}

// Run the check
main().catch(console.error);
