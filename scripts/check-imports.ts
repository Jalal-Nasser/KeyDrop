import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Simple case sensitivity checker
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
async function existsCaseSensitive(filePath: string): Promise<boolean> {
  try {
    const dir = path.dirname(filePath);
    const base = path.basename(filePath);
    
    const files = await fs.promises.readdir(dir);
    return files.some(f => f === base);
  } catch (e) {
    return false;
  }
}


/**
 * Check a single file for case sensitivity issues
 */
async function checkFile(filePath: string): Promise<void> {
  try {
    // Check file path case sensitivity
    const normalizedPath = filePath.toLowerCase();
    const existingPath = pathMap.get(normalizedPath);
    
    if (existingPath && existingPath !== filePath) {
      caseConflicts.push(`Case conflict: "${filePath}" vs "${existingPath}"`);
    } else {
      pathMap.set(normalizedPath, filePath);
    }
    
    // Check if the file exists with exact case
    if (!await existsCaseSensitive(filePath)) {
      caseConflicts.push(`Case mismatch: "${filePath}"`);
    }
  } catch (e) {
    console.error(`Error checking file ${filePath}:`, e);
  }
}

/**
 * Main function to check the project for case sensitivity issues
 */
async function main() {
  console.log('🔍 Checking for case sensitivity issues...\n');
  
  try {
    // Get all files in source directories
    const files: string[] = [];
    
    for (const dir of SOURCE_DIRS) {
      const pattern = path.join(dir, '**/*.{ts,tsx,js,jsx}');
      const matches = await glob(pattern, {
        cwd: PROJECT_ROOT,
        ignore: IGNORE_PATTERNS,
        absolute: true,
        nodir: true,
      });
      
      files.push(...matches);
    }
    
    // Check each file
    await Promise.all(files.map(file => checkFile(file)));
    
    // Report results
    if (caseConflicts.length > 0) {
      console.log('🚨 Found case sensitivity issues:');
      caseConflicts.forEach(conflict => console.log(`- ${conflict}`));
      console.log('\n💡 Please fix these case sensitivity issues to ensure compatibility with case-sensitive file systems.');
      process.exit(1);
    } else {
      console.log('✅ No case sensitivity issues found!');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error checking files:', error);
    process.exit(1);
  }
}

// Run the check
main().catch(console.error);
