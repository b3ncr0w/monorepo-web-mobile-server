const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { findAndroidSdk } = require('./check-android-sdk');

function checkAndroidEmulator() {
    try {
        const sdkPath = findAndroidSdk();
        const emuPath = path.join(sdkPath, 'emulator');

        // Check if emulator is installed
        if (!fs.existsSync(emuPath)) {
            console.log('📱 Installing Android emulator...');
            execSync(`${sdkPath}/cmdline-tools/latest/bin/sdkmanager --install "emulator"`, { stdio: 'inherit' });
        }

        // Check if any system image is installed
        const systemImage = 'system-images;android-33;google_apis;x86_64';
        console.log('📱 Checking Android system image...');
        execSync(`${sdkPath}/cmdline-tools/latest/bin/sdkmanager --install "${systemImage}"`, { stdio: 'inherit' });

        // Check if default emulator exists
        const emuList = execSync(`${emuPath}/emulator -list-avds`).toString();
        if (!emuList.includes('Pixel_6')) {
            console.log('📱 Creating Android emulator...');
            execSync(`echo "no" | ${sdkPath}/tools/bin/avdmanager create avd -n Pixel_6 -k "${systemImage}" -d "pixel_6"`, { stdio: 'inherit' });
        }

        console.log('✅ Android emulator is ready');
        return true;
    } catch (error) {
        console.error('❌ Failed to setup Android emulator:', error.message);
        return false;
    }
}

if (require.main === module) {
    checkAndroidEmulator();
}

module.exports = checkAndroidEmulator; 