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

function checkIosSimulator() {
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

        // Check available simulators
        const simulators = JSON.parse(execSync('xcrun simctl list devices available -j').toString());
        const runtime = Object.keys(simulators.devices).find(key => key.includes('iOS'));
        const device = simulators.devices[runtime]?.[0];

        if (!device) {
            console.log('📱 No iOS simulator found');
            
            // Get or install runtime
            const latestRuntime = getAvailableRuntimes()[0] || installSimulatorRuntime();
            if (!latestRuntime) {
                throw new Error('Could not install iOS runtime');
            }

            // Create simulator with available runtime
            console.log('📱 Creating iOS simulator...');
            execSync(`xcrun simctl create "iPhone 15" "com.apple.CoreSimulator.SimDeviceType.iPhone-15" "com.apple.CoreSimulator.SimRuntime.iOS-${latestRuntime.replace('.', '-')}"`, { stdio: 'inherit' });
        }

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
    checkIosSimulator();
}

module.exports = checkIosSimulator; 