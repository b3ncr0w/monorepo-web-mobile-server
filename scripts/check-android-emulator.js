const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const { findAndroidSdk } = require('./check-android-sdk');

// Cross-platform sleep function
function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function startEmulator() {
    try {
        const sdkPath = findAndroidSdk();
        const platform = os.platform();
        
        // Get platform-specific paths
        const emulatorPath = platform === 'win32'
            ? path.join(sdkPath, 'emulator', 'emulator.exe')
            : path.join(sdkPath, 'emulator', 'emulator');
        
        const adbPath = platform === 'win32'
            ? path.join(sdkPath, 'platform-tools', 'adb.exe')
            : path.join(sdkPath, 'platform-tools', 'adb');

        // List available emulators
        const emulatorsOutput = execSync(`"${emulatorPath}" -list-avds`, { encoding: 'utf8' }).trim();
        
        if (!emulatorsOutput) {
            console.error('\n❌ No Android emulators found!');
            console.log('\n📱 Please create an emulator:');
            console.log('1. Open Android Studio');
            console.log('2. Go to Tools > Device Manager');
            console.log('3. Click "Create Device"');
            console.log('4. Select a phone definition and click "Next"');
            console.log('5. Download and select a system image');
            console.log('6. Complete the emulator creation\n');
            process.exit(1);
        }

        const emulators = emulatorsOutput.split('\n');
        const emulator = emulators[0]; // Use first available emulator

        // Check if emulator is already running
        const adbDevices = execSync(`"${adbPath}" devices`, { encoding: 'utf8' });
        if (adbDevices.includes('emulator')) {
            console.log('✅ Emulator already running');
            return;
        }

        // Start the emulator
        console.log(`🚀 Starting emulator: ${emulator}`);
        console.log('⏳ Waiting for emulator to start...');
        
        // Start emulator in background
        if (platform === 'win32') {
            execSync(`start cmd /c "${emulatorPath}" -avd ${emulator}`, { stdio: 'ignore' });
        } else {
            execSync(`"${emulatorPath}" -avd ${emulator} &`, { stdio: 'ignore' });
        }

        // Wait for emulator to be ready
        let attempts = 30; // 30 seconds timeout
        while (attempts > 0) {
            try {
                const output = execSync(`"${adbPath}" shell getprop sys.boot_completed`, { encoding: 'utf8' });
                if (output.trim() === '1') {
                    console.log('✅ Emulator is ready');
                    return;
                }
            } catch (e) {
                // Ignore errors while waiting for emulator
            }
            await sleep(1);
            attempts--;
        }

        throw new Error('Timeout waiting for emulator to start');
    } catch (error) {
        console.error('\n❌ Error starting emulator:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    startEmulator().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}

module.exports = startEmulator; 