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
        '/opt/homebrew/share/android-commandlinetools',  // Homebrew Android SDK location
        path.join(homeDir, 'AppData/Local/Android/Sdk'), // Windows
        path.join(homeDir, 'Android/Sdk'),              // Linux
    ].filter(Boolean);

    // Check all possible locations
    for (const sdkPath of possiblePaths) {
        if (sdkPath && fs.existsSync(sdkPath)) {
            // For Homebrew installation, we need to use the Android SDK from Android Studio
            if (sdkPath === '/opt/homebrew/share/android-commandlinetools') {
                // Check if Android Studio SDK exists
                const studioSdkPath = path.join(homeDir, 'Library/Android/sdk');
                if (fs.existsSync(studioSdkPath)) {
                    return studioSdkPath; // Use Android Studio SDK instead
                }
            }
            return sdkPath;
        }
    }

    // If not found, try to install on macOS
    if (platform === 'darwin') {
        console.log('📱 Android SDK not found. Installing...');
        try {
            execSync('brew install android-commandlinetools', { stdio: 'inherit' });
            console.log('\n⚠️  Please also install Android Studio to get the full SDK:');
            console.log('1. Download from: https://developer.android.com/studio');
            console.log('2. Open Android Studio and complete the setup');
            console.log('3. Go to Tools > SDK Manager');
            console.log('4. Install the SDK platforms and tools you need');
            process.exit(1);
        } catch (error) {
            console.error('❌ Failed to install Android SDK:', error.message);
        }
    }

    console.error('❌ Android SDK not found! Please install Android Studio manually:');
    console.log('Download from: https://developer.android.com/studio');
    process.exit(1);
}

function setupLocalProperties(sdkPath) {
    // Wait for the android directory to be created by prebuild
    const maxAttempts = 10;
    let attempts = 0;
    const androidDir = path.join(__dirname, '../apps/mobile/android');
    
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

function configureSDK(sdkPath) {
    try {
        // Accept Android SDK licenses
        execSync(`yes | ${sdkPath}/cmdline-tools/latest/bin/sdkmanager --licenses`, { stdio: 'inherit' });
        
        // Install required SDK packages
        execSync(`${sdkPath}/cmdline-tools/latest/bin/sdkmanager \
            "platform-tools" \
            "platforms;android-33" \
            "build-tools;33.0.0"`, { stdio: 'inherit' });
    } catch (error) {
        console.warn('⚠️  Could not configure SDK packages:', error.message);
        console.log('You may need to run Android Studio to complete the setup');
    }
}

function setupAndroidSdk() {
    try {
        const sdkPath = findAndroidSdk();
        process.env.ANDROID_HOME = sdkPath;
        
        setupLocalProperties(sdkPath);
        configureSDK(sdkPath);

        console.log('✅ Android SDK found at:', sdkPath);
        console.log('✅ Created local.properties file');
        console.log('✅ SDK configuration complete');
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
    setupLocalProperties,
    configureSDK
}; 