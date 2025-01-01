const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

function findAndroidSdk() {
    // Get home directory in a cross-platform way
    const homeDir = os.homedir();
    
    // Common Android SDK locations
    const possiblePaths = [
        path.join(homeDir, 'Library/Android/sdk'),     // macOS
        path.join(homeDir, 'AppData/Local/Android/Sdk'), // Windows
        path.join(homeDir, 'Android/Sdk'),             // Linux
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

    // Try to get from command line tools if available
    try {
        const cmdResult = execSync('which android').toString().trim();
        if (cmdResult) {
            const sdkPath = path.resolve(cmdResult, '../../');
            if (fs.existsSync(sdkPath)) {
                return sdkPath;
            }
        }
    } catch (e) {
        // Command line tools not found
    }

    return null;
}

function setupAndroidSdk() {
    const sdkPath = findAndroidSdk();
    if (!sdkPath) {
        console.error('\x1b[31mError: Android SDK not found!\x1b[0m');
        console.log('\nPlease install Android Studio and SDK from:');
        console.log('https://developer.android.com/studio');
        process.exit(1);
    }

    const localPropertiesPath = path.join(__dirname, '../android/local.properties');
    const content = `sdk.dir=${sdkPath.replace(/\\/g, '/')}`;

    fs.writeFileSync(localPropertiesPath, content);
    console.log('\x1b[32mSuccessfully configured Android SDK path!\x1b[0m');
}

setupAndroidSdk(); 