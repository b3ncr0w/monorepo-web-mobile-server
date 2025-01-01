const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { findAndroidSdk } = require('./check-android-sdk');

function installAndroidStudio() {
    try {
        // Check if Homebrew is installed
        try {
            execSync('which brew');
        } catch {
            console.log('❌ Homebrew is required to install Android Studio');
            console.log('📥 Install Homebrew first: https://brew.sh');
            process.exit(1);
        }

        console.log('📱 Installing Android Studio via Homebrew...');
        execSync('brew install --cask android-studio', { stdio: 'inherit' });
        
        console.log('\n✅ Android Studio installed successfully');
        console.log('\nPlease complete the setup:');
        console.log('1. Open Android Studio');
        console.log('2. Go to Tools > Device Manager');
        console.log('3. Click "Create Device" and follow the wizard');
        console.log('4. Recommended: Choose a Pixel device with Play Store');
        console.log('5. Select Android API 33 or newer\n');
        process.exit(1);
    } catch (error) {
        console.error('❌ Failed to install Android Studio:', error.message);
        process.exit(1);
    }
}

function checkAndroidStudio() {
    try {
        // Check for Android Studio on different platforms
        if (process.platform === 'darwin') {
            if (!fs.existsSync('/Applications/Android Studio.app')) {
                console.log('⚠️  Android Studio is not installed');
                console.log('\nWould you like to install Android Studio via Homebrew? (y/n)');
                
                const response = spawnSync('read', ['-n', '1'], { shell: true, stdio: 'inherit' });
                const answer = execSync('echo $?').toString().trim();
                
                if (answer === '0') {
                    installAndroidStudio();
                } else {
                    console.log('\n📥 You can install Android Studio manually from: https://developer.android.com/studio');
                    process.exit(1);
                }
            }
        }
        // Add Windows/Linux checks if needed
    } catch (error) {
        console.error('❌ Error checking Android Studio:', error.message);
        process.exit(1);
    }
}

function checkAndroidEmulator() {
    try {
        checkAndroidStudio();
        const sdkPath = findAndroidSdk();
        const emuPath = path.join(sdkPath, 'emulator');

        // Check if emulator is installed
        if (!fs.existsSync(emuPath)) {
            console.log('📱 Installing Android emulator...');
            execSync(`${sdkPath}/cmdline-tools/latest/bin/sdkmanager --install "emulator"`, { stdio: 'inherit' });
        }

        // Check for existing emulators
        const emuList = execSync(`${emuPath}/emulator -list-avds`).toString().trim();
        
        if (!emuList) {
            console.log('\n❌ No Android emulators found');
            console.log('\nPlease create an emulator using Android Studio:');
            console.log('1. Open Android Studio');
            console.log('2. Go to Tools > Device Manager');
            console.log('3. Click "Create Device" and follow the wizard');
            console.log('4. Recommended: Choose a Pixel device with Play Store');
            console.log('5. Select Android API 33 or newer\n');
            process.exit(1);
        }

        console.log('✅ Android emulator found:', emuList.split('\n')[0]);
        return true;
    } catch (error) {
        console.error('❌ Failed to check Android emulator:', error.message);
        return false;
    }
}

if (require.main === module) {
    checkAndroidEmulator();
}

module.exports = checkAndroidEmulator; 