const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function findAndroidSdk() {
    const homeDir = os.homedir();
    const platform = os.platform();

    // Common Android SDK locations
    const possiblePaths = [
        process.env.ANDROID_HOME,
        process.env.ANDROID_SDK_ROOT,
        path.join(homeDir, 'Library/Android/sdk'),      // macOS default
        path.join(homeDir, 'AppData/Local/Android/Sdk'), // Windows
        path.join(homeDir, 'Android/Sdk'),              // Linux
    ].filter(Boolean);

    // Check all possible locations
    for (const sdkPath of possiblePaths) {
        if (sdkPath && fs.existsSync(sdkPath)) {
            // Verify this is a complete SDK installation by checking for essential directories
            const essentialDirs = ['platform-tools', 'emulator', 'platforms'];
            const hasAllDirs = essentialDirs.every(dir => fs.existsSync(path.join(sdkPath, dir)));
            
            if (hasAllDirs) {
                return sdkPath;
            }
        }
    }

    // If not found, guide user to install Android Studio
    console.error('❌ Android Studio and SDK not found!');
    console.log('\n📱 Please complete these steps:');
    console.log('1. Download Android Studio from: https://developer.android.com/studio');
    console.log('2. Install Android Studio and launch it');
    console.log('3. Install Android SDK');
    console.log('4. Run this command again\n');
    process.exit(1);
}

function setupLocalProperties(sdkPath) {
    const androidDir = path.join(__dirname, '../apps/mobile/android');
    
    if (!fs.existsSync(androidDir)) {
        console.error('❌ Android directory not found at:', androidDir);
        process.exit(1);
    }

    const localPropertiesPath = path.join(androidDir, 'local.properties');
    const localPropertiesContent = `sdk.dir=${sdkPath.replace(/\\/g, '/')}`;
    fs.writeFileSync(localPropertiesPath, localPropertiesContent);
}

function setupAndroidSdk() {
    try {
        const sdkPath = findAndroidSdk();
        process.env.ANDROID_HOME = sdkPath;
        
        setupLocalProperties(sdkPath);

        console.log('✅ Android SDK found at:', sdkPath);
        console.log('✅ Created local.properties file');
        return true;
    } catch (error) {
        console.error('Error:', error.message);
        return false;
    }
}

if (require.main === module) {
    if (!setupAndroidSdk()) {
        process.exit(1);
    }
}

module.exports = {
    findAndroidSdk,
    setupAndroidSdk,
    setupLocalProperties
}; 