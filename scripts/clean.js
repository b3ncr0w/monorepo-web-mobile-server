const { rmSync } = require('fs');
const { sync } = require('glob');

const patterns = [
  // Root level and workspace caches
  'node_modules',
  '**/node_modules',
  
  // Build outputs
  'dist',
  'dist/**',
  '**/dist-ssr',
  '**/web-build',
  '**/android',
  
  // Mobile specific
  '**/.expo',
  '**/expo-env.d.ts',
  '**/app-example',
  '**/ios',
  '**/android',
  
  // TypeScript build info
  '**/*.tsbuildinfo',
  '**/tsconfig.*.tsbuildinfo',
  
  // Environment and test files
  '**/.env.local',
  '**/coverage',
  
  // Logs
  '**/*.log',
  '**/npm-debug.*',
  '**/yarn-debug.*',
  '**/yarn-error.*',
  
  // System files
  '._*',
  '**/.DS_Store',
  
  // IDE files
  '**/.idea',
  '**/.vscode/*',
  '!**/.vscode/extensions.json'
];

patterns.forEach(pattern => {
  const paths = sync(pattern, { absolute: true });
  paths.forEach(path => {
    try {
      rmSync(path, { recursive: true, force: true });
      // console.log(`Removed: ${path}`);
    } catch (err) {
      console.error(`Failed to remove ${path}:`, err);
    }
  });
}); 