const fs = require('fs');
const path = require('path');

const CLEAN = [
    'node_modules', 'dist', '.expo', 'web-build', 'android', 'ios',
    'coverage', 'expo-env.d.ts', '*.tsbuildinfo', '*.log', '.DS_Store'
];
const KEEP = ['.git', '.github', '.vscode', '.gitignore', '.env', 'assets'];

function clean(dir) {
    if (!fs.existsSync(dir)) return;
    
    fs.readdirSync(dir).forEach(item => {
        if (KEEP.includes(item)) return;
        
        const fullPath = path.join(dir, item);
        const isDir = fs.lstatSync(fullPath).isDirectory();
        const relativePath = path.relative(process.cwd(), fullPath);

        if (isDir) {
            if (CLEAN.includes(item)) {
                console.log(`📦 ${relativePath}`);
                fs.rmSync(fullPath, { recursive: true, force: true });
            } else {
                clean(fullPath);
            }
        } else if (CLEAN.some(p => p.includes('*') ? 
            item.match(new RegExp(p.replace('*', '.*'))) : item === p)) {
            console.log(`🗑️  ${relativePath}`);
            fs.rmSync(fullPath);
        }
    });
}

console.log('🧹 Cleaning project...');
clean(process.cwd());
['apps', 'packages'].forEach(dir => fs.existsSync(dir) && clean(dir));
