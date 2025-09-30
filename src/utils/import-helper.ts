/**
 * Helper function to ensure case-sensitive imports work correctly on case-sensitive file systems
 * This is particularly important for Linux environments
 */

type ImportMap = {
  [key: string]: any;
};

/**
 * Creates a case-sensitive import helper
 * @param imports Object with the actual imports
 * @returns A proxy that handles case-sensitive property access
 */
export function createImportHelper<T extends ImportMap>(imports: T): T {
  return new Proxy(imports, {
    get(target, prop) {
      if (typeof prop === 'string') {
        // Try exact match first
        if (prop in target) {
          return target[prop as keyof T];
        }
        
        // Try case-insensitive match
        const lowerProp = prop.toLowerCase();
        const matchedKey = Object.keys(target).find(
          (key) => key.toLowerCase() === lowerProp
        );
        
        if (matchedKey) {
          console.warn(
            `Case-sensitive import warning: '${prop}' should be '${matchedKey}'. ` +
            'This may cause issues on case-sensitive file systems.'
          );
          return target[matchedKey as keyof T];
        }
      }
      
      return undefined;
    },
  });
}

/**
 * Helper to safely import components with case sensitivity checks
 * @param importFn Function that returns a dynamic import
 * @returns The imported module with case-sensitive checks
 */
export async function safeImport<T>(importFn: () => Promise<T>): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'MODULE_NOT_FOUND') {
      const message = error.message;
      const match = message.match(/Cannot find module '([^']+)'/);
      if (match) {
        const modulePath = match[1];
        console.error(
          `Import error: ${message}\n` +
          'This might be a case-sensitivity issue. Please check the exact casing of your imports.'
        );
      }
    }
    throw error;
  }
}
