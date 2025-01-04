const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

function findAndroidSdk() {
    const homeDir = os.homedir();
    
    // Common Android SDK locations for all platforms
    const possiblePaths = [
        process.env.ANDROID_HOME,
        process.env.ANDROID_SDK_ROOT,
        path.join(homeDir, 'Library/Android/sdk'),      // macOS default
        path.join(homeDir, 'AppData/Local/Android/Sdk'), // Windows default
        path.join(homeDir, 'Android/Sdk'),              // Linux default
        'C:\\Android\\sdk',                             // Alternative Windows path
    ].filter(Boolean); // Remove undefined/null entries
    
    // Check all possible locations
    for (const sdkPath of possiblePaths) {
        if (sdkPath && fs.existsSync(sdkPath)) {
            // Verify this is a complete SDK installation by checking for essential directories
            const essentialDirs = ['platform-tools', 'platforms'];
            const hasAllDirs = essentialDirs.every(dir => fs.existsSync(path.join(sdkPath, dir)));
            
            if (hasAllDirs) {
                return sdkPath;
            }
        }
    }
    
    return null;
}

function main() {
    const sdkPath = findAndroidSdk();
    
    if (!sdkPath) {
        console.error('\n❌ Android Studio and SDK not found!');
        console.log('\n📱 Please complete these steps:');
        console.log('1. Download Android Studio from: https://developer.android.com/studio');
        console.log('2. Install Android Studio and launch it');
        console.log('3. Complete the Android SDK installation');
        console.log('4. Run this command again\n');
        process.exit(1);
    }

    // Set environment variables
    process.env.ANDROID_HOME = sdkPath;
    process.env.ANDROID_SDK_ROOT = sdkPath;

    console.log('✅ Android SDK configuration successful!');
    console.log('📍 SDK Location:', sdkPath);
}

// Only run main if this file is being run directly
if (require.main === module) {
    main();
}

// Export functions for use in other scripts
module.exports = {
    findAndroidSdk,
    main
}; 