const { execSync } = require('child_process');

try {
    execSync('eas --version', { stdio: 'ignore' });
} catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'EAS CLI is not installed globally.');
    console.log('\x1b[36m%s\x1b[0m', 'Installing EAS CLI globally...');
    
    try {
        execSync('yarn global add eas-cli', { stdio: 'inherit' });
        console.log('\x1b[32m%s\x1b[0m', 'EAS CLI installed successfully!');
    } catch (installError) {
        console.error('\x1b[31m%s\x1b[0m', 'Failed to install EAS CLI.');
        console.log('Please run manually: yarn global add eas-cli');
        process.exit(1);
    }
}
