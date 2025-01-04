const { execSync } = require('child_process');
const readline = require('readline');
const path = require('path');
const os = require('os');
const { findAndroidSdk } = require('./check-android-sdk');

function getEmulators() {
    const sdkPath = findAndroidSdk();
    const platform = os.platform();
    
    // Platform-specific paths to emulator binary
    const emulatorCmd = platform === 'win32'
        ? path.join(sdkPath, 'emulator', 'emulator.exe')
        : path.join(sdkPath, 'emulator', 'emulator');

    try {
        const output = execSync(`${emulatorCmd} -list-avds`).toString();
        return output.split('\n').filter(Boolean);
    } catch (error) {
        console.error('❌ No Android Virtual Devices found');
        console.log('\n📱 Please create an Android Virtual Device:');
        console.log('1. Open Android Studio');
        console.log('2. Go to Tools > Device Manager');
        console.log('3. Click "Create Device"');
        console.log('4. Select "Pixel 9" and click Next');
        console.log('5. If no system images are available:');
        console.log('   a. Click "Download" next to a recommended system image');
        console.log('   b. Wait for the download and installation to complete');
        console.log('6. Select the system image and click Next');
        console.log('7. Click Finish');
        console.log('8. Run this command again\n');
        process.exit(1);
    }
}

function startEmulator(avdName) {
    const sdkPath = findAndroidSdk();
    const platform = os.platform();
    const emulatorPath = platform === 'win32'
        ? path.join(sdkPath, 'emulator', 'emulator.exe')
        : path.join(sdkPath, 'emulator', 'emulator');

    console.log(`🚀 Starting emulator: ${avdName}`);

    // Execute cross-os-terminal with the emulator command
    execSync(`node ${path.join(__dirname, 'cross-os-terminal.js')} "${emulatorPath} -avd ${avdName}"`);

    // Wait for the emulator to be detected
    const adbPath = platform === 'win32'
        ? path.join(sdkPath, 'platform-tools', 'adb.exe')
        : path.join(sdkPath, 'platform-tools', 'adb');

    console.log('⏳ Waiting for emulator to start...');
    
    // Try for 60 seconds
    for (let i = 0; i < 60; i++) {
        try {
            const devices = execSync(`${adbPath} devices`).toString();
            if (devices.includes('emulator')) {
                console.log('✅ Emulator detected');
                
                // Wait for device to be fully booted
                console.log('⏳ Waiting for device to boot (this may take a minute)...');
                let lastStatus = '';
                for (let j = 0; j < 60; j++) {
                    try {
                        // Check if boot is complete
                        const bootComplete = execSync(`${adbPath} -s emulator-5554 shell getprop sys.boot_completed 2>&1`).toString().trim();
                        if (bootComplete === '1') {
                            process.stdout.write('\n'); // Clear the status line
                            console.log('✅ Device fully booted');
                            return;
                        }
                        // Update status with a spinner
                        const status = `\r⏳ Device status: ${bootComplete} [${(j + 1)}/60s]`;
                        if (status !== lastStatus) {
                            process.stdout.write(status);
                            lastStatus = status;
                        }
                    } catch (error) {
                        // Ignore errors while waiting for boot
                    }
                    execSync('sleep 1');
                }
                process.stdout.write('\n'); // Clear the status line
                console.error('❌ Timeout waiting for device to boot');
                process.exit(1);
            }
        } catch (error) {
            // Ignore errors and keep trying
        }
        execSync('sleep 1');
    }

    console.error('❌ Timeout waiting for emulator to start');
    process.exit(1);
}

async function selectEmulator(emulators) {
    if (emulators.length === 0) {
        return null;
    }

    if (emulators.length === 1) {
        return emulators[0];
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('\nAvailable emulators:');
    emulators.forEach((emulator, index) => {
        console.log(`${index + 1}. ${emulator}`);
    });

    return new Promise((resolve) => {
        rl.question('\nSelect an emulator (enter number): ', (answer) => {
            rl.close();
            const index = parseInt(answer) - 1;
            if (index >= 0 && index < emulators.length) {
                resolve(emulators[index]);
            } else {
                console.error('❌ Invalid selection');
                process.exit(1);
            }
        });
    });
}

async function checkAndroidEmulator() {
    try {
        // Get list of emulators
        const emulators = getEmulators();

        // Let user select an emulator
        const selectedEmulator = await selectEmulator(emulators);
        if (!selectedEmulator) {
            console.error('❌ No emulator selected');
            process.exit(1);
        }

        // Check if emulator is already running
        const sdkPath = findAndroidSdk();
        const platform = os.platform();
        const adbPath = platform === 'win32'
            ? path.join(sdkPath, 'platform-tools', 'adb.exe')
            : path.join(sdkPath, 'platform-tools', 'adb');

        const runningDevices = execSync(`${adbPath} devices`).toString();
        const isEmulatorRunning = runningDevices.includes('emulator');

        if (!isEmulatorRunning) {
            try {
                // Start emulator and wait for it to boot
                startEmulator(selectedEmulator);
            } catch (error) {
                console.error('❌ Error starting emulator:', error.message);
                process.exit(1);
            }
        } else {
            console.log('✅ Emulator is already running');
            
            // If emulator is already running, verify it's fully booted
            try {
                const bootComplete = execSync(`${adbPath} -s emulator-5554 shell getprop sys.boot_completed`).toString().trim();
                if (bootComplete !== '1') {
                    console.log('⏳ Waiting for device to boot...');
                    // Wait for boot to complete
                    for (let j = 0; j < 60; j++) {
                        const bootCheck = execSync(`${adbPath} -s emulator-5554 shell getprop sys.boot_completed`).toString().trim();
                        if (bootCheck === '1') {
                            console.log('✅ Device fully booted');
                            break;
                        }
                        execSync('sleep 1');
                    }
                }
            } catch (error) {
                console.error('❌ Error checking device boot state:', error.message);
                process.exit(1);
            }
        }

        return true;
    } catch (error) {
        console.error('Error:', error.message);
        return false;
    }
}

if (require.main === module) {
    checkAndroidEmulator();
}

module.exports = checkAndroidEmulator; 