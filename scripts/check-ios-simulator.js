const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkXcode() {
    try {
        // Check if Xcode is installed
        execSync('xcode-select -p');
        const xcodeVersion = execSync('xcodebuild -version').toString();
        console.log('✅ Found Xcode:', xcodeVersion.split('\n')[0]);
        return true;
    } catch (error) {
        console.log('\n❌ Xcode not found');
        console.log('\nPlease install Xcode:');
        console.log('1. Open App Store');
        console.log('2. Search for "Xcode"');
        console.log('3. Install Xcode');
        console.log('4. Open Xcode and complete the installation');
        console.log('5. Run this command again\n');
        return false;
    }
}

function getAvailableRuntimes() {
    try {
        const runtimes = execSync('xcrun simctl list runtimes').toString();
        const iOSRuntimes = runtimes.match(/iOS \d+\.\d+/g) || [];
        return iOSRuntimes.map(r => r.replace('iOS ', ''));
    } catch {
        return [];
    }
}

function installSimulatorRuntime() {
    try {
        console.log('📱 Installing iOS Simulator runtime...');
        // First, download additional components
        execSync('xcodebuild -downloadPlatform iOS', { stdio: 'inherit' });
        
        // Wait for the runtime to be available
        let attempts = 0;
        while (attempts < 5) {
            const runtimes = getAvailableRuntimes();
            if (runtimes.length > 0) {
                return runtimes[runtimes.length - 1]; // Return latest runtime
            }
            console.log('⏳ Waiting for runtime installation...');
            execSync('sleep 5');
            attempts++;
        }
        throw new Error('Timeout waiting for runtime installation');
    } catch (error) {
        console.error('❌ Failed to install simulator runtime:', error.message);
        return null;
    }
}

function getAvailableDeviceTypes() {
    try {
        const devices = JSON.parse(execSync('xcrun simctl list devicetypes -j').toString());
        return devices.devicetypes
            .filter(device => device.name.includes('iPhone') || device.name.includes('iPad'))
            .map(device => ({
                name: device.name,
                identifier: device.identifier
            }));
    } catch {
        return [];
    }
}

function promptDeviceSelection(deviceTypes) {
    console.log('\nAvailable device types:');
    deviceTypes.forEach((device, index) => {
        console.log(`${index + 1}. ${device.name}`);
    });
    
    // Using readline for synchronous input
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        readline.question('\nSelect a device type (enter number): ', (answer) => {
            readline.close();
            const index = parseInt(answer) - 1;
            if (index >= 0 && index < deviceTypes.length) {
                resolve(deviceTypes[index]);
            } else {
                console.log('Invalid selection, using iPhone 15 as default');
                resolve(deviceTypes.find(d => d.name.includes('iPhone 15')) || deviceTypes[0]);
            }
        });
    });
}

async function checkIosSimulator() {
    try {
        // First check Xcode
        if (!checkXcode()) {
            process.exit(1);
        }

        // Check Command Line Tools
        try {
            execSync('xcrun --version');
        } catch {
            console.log('📦 Installing Command Line Tools...');
            execSync('xcode-select --install', { stdio: 'inherit' });
            console.log('⏳ Waiting for Command Line Tools installation...');
            execSync('until xcrun --version &>/dev/null; do sleep 5; done');
        }

        // Get available device types and prompt for selection
        const deviceTypes = getAvailableDeviceTypes();
        if (deviceTypes.length === 0) {
            throw new Error('No device types available');
        }

        const selectedDevice = await promptDeviceSelection(deviceTypes);
        
        // Get or install runtime if needed
        let latestRuntime = getAvailableRuntimes()[0];
        if (!latestRuntime) {
            latestRuntime = installSimulatorRuntime();
            if (!latestRuntime) {
                throw new Error('Could not install iOS runtime');
            }
        }

        // Delete existing simulator with the same name if it exists
        try {
            const existingDevices = JSON.parse(execSync('xcrun simctl list devices -j').toString());
            const existingDevice = Object.values(existingDevices.devices)
                .flat()
                .find(device => device.name === selectedDevice.name);
            
            if (existingDevice) {
                execSync(`xcrun simctl delete "${existingDevice.udid}"`);
            }
        } catch (error) {
            console.log('Warning: Could not check for existing devices', error.message);
        }

        // Create simulator with selected device type
        console.log(`📱 Creating iOS simulator for ${selectedDevice.name}...`);
        const creationOutput = execSync(
            `xcrun simctl create "${selectedDevice.name}" "${selectedDevice.identifier}" "com.apple.CoreSimulator.SimRuntime.iOS-${latestRuntime.replace('.', '-')}"`,
            { encoding: 'utf8' }
        ).trim();

        // Boot the simulator
        console.log('🚀 Booting simulator...');
        execSync(`xcrun simctl boot "${creationOutput}"`, { stdio: 'inherit' });
        
        // Open Simulator.app
        execSync('open -a Simulator', { stdio: 'inherit' });

        console.log('✅ iOS simulator is ready');
        return true;
    } catch (error) {
        console.error('❌ Failed to setup iOS simulator:', error.message);
        if (error.message.includes('Could not install iOS runtime')) {
            console.log('\nPlease complete these steps:');
            console.log('1. Open Xcode');
            console.log('2. Go to Settings > Platforms');
            console.log('3. Download iOS Simulator runtime');
            console.log('4. Wait for the download to complete');
            console.log('5. Run this command again\n');
        }
        process.exit(1);
    }
}

if (require.main === module) {
    checkIosSimulator().catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
}

module.exports = checkIosSimulator; 