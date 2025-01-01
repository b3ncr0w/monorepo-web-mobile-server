const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

function findAndroidSdk() {
    const homeDir = os.homedir();
    
    // Common Android SDK locations
    const possiblePaths = [
        '/opt/homebrew/share/android-commandlinetools',  // Homebrew Android SDK location
        path.join(homeDir, 'Library/Android/sdk'),      // macOS default
        path.join(homeDir, 'AppData/Local/Android/Sdk'), // Windows
        path.join(homeDir, 'Android/Sdk'),              // Linux
    ];

    // Check ANDROID_HOME env variable first
    if (process.env.ANDROID_HOME && fs.existsSync(process.env.ANDROID_HOME)) {
        return process.env.ANDROID_HOME;
    }

    // Check common locations
    for (const sdkPath of possiblePaths) {
        if (fs.existsSync(sdkPath)) {
            return sdkPath;
        }
    }

    throw new Error('Android SDK not found! Please run yarn build:android first to install it.');
}

function setupLocalProperties(sdkPath) {
    // Wait for the android directory to be created by prebuild
    const maxAttempts = 10;
    let attempts = 0;
    const androidDir = path.join(__dirname, '../android');
    
    while (!fs.existsSync(androidDir) && attempts < maxAttempts) {
        attempts++;
        // Wait for 1 second
        execSync('sleep 1');
    }

    if (!fs.existsSync(androidDir)) {
        throw new Error('Android directory was not created by prebuild');
    }

    const localPropertiesPath = path.join(androidDir, 'local.properties');
    const localPropertiesContent = `sdk.dir=${sdkPath.replace(/\\/g, '/')}`;
    fs.writeFileSync(localPropertiesPath, localPropertiesContent);
}

try {
    const sdkPath = findAndroidSdk();
    process.env.ANDROID_HOME = sdkPath;
    
    // Set up local.properties
    setupLocalProperties(sdkPath);
    
    console.log('✅ Android SDK found at:', sdkPath);
    console.log('✅ Created local.properties file');
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
} 