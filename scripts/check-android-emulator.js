const { execSync } = require('child_process');
const readline = require('readline');
const path = require('path');
const os = require('os');
const { findAndroidSdk } = require('./check-android-sdk');

function findAdb() {
  const sdkPath = findAndroidSdk();
  const platform = os.platform();
  
  // Platform-specific paths to adb
  const adbPath = platform === 'win32'
    ? path.join(sdkPath, 'platform-tools', 'adb.exe')
    : path.join(sdkPath, 'platform-tools', 'adb');

  return adbPath;
}

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
    console.error('Error listing emulators:', error.message);
    return [];
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
  const adb = findAdb();
  console.log('⏳ Waiting for emulator to start...');
  
  // Try for 30 seconds
  for (let i = 0; i < 30; i++) {
    try {
      const devices = execSync(`${adb} devices`).toString();
      if (devices.includes('emulator')) {
        console.log('✅ Emulator detected');
        process.exit(0);
      }
    } catch (error) {
      // Ignore errors and keep trying
    }
    // Wait 1 second before next check
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
    // First check if Android SDK is available
    const sdkPath = findAndroidSdk();
    process.env.ANDROID_HOME = sdkPath;

    // Check if adb is available
    const adb = findAdb();
    try {
      execSync(`${adb} --version`, { stdio: 'ignore' });
    } catch {
      console.error('❌ Android Debug Bridge (adb) not found');
      console.log('\nPlease check your Android Studio installation:');
      console.log('1. Open Android Studio');
      console.log('2. Go to Tools > SDK Manager');
      console.log('3. In the SDK Tools tab, make sure "Android SDK Platform-Tools" is installed');
      console.log('4. Run this command again\n');
      process.exit(1);
    }

    // Get list of emulators
    const emulators = getEmulators();

    if (emulators.length === 0) {
      console.error('❌ No Android emulators found');
      console.log('\nTo create an emulator:');
      console.log('1. Open Android Studio');
      console.log('2. Go to Tools > Device Manager');
      console.log('3. Click "Create Device"');
      console.log('4. Select a device definition (e.g., "Pixel 7")');
      console.log('5. Select a system image (e.g., "API 34")');
      console.log('6. Complete the emulator creation');
      console.log('7. Run this command again\n');
      process.exit(1);
    }

    // Let user select an emulator
    const selectedEmulator = await selectEmulator(emulators);
    if (!selectedEmulator) {
      console.error('❌ No emulator selected');
      process.exit(1);
    }

    // Check if emulator is already running
    const runningDevices = execSync(`${adb} devices`).toString();
    const isEmulatorRunning = runningDevices.includes('emulator');

    if (!isEmulatorRunning) {
      // Start emulator but don't wait for it to boot
      startEmulator(selectedEmulator).catch(error => {
        console.error('❌ Error starting emulator:', error.message);
      });
    } else {
      console.log('✅ Emulator is already running');
    }

    // Return true immediately to allow dev commands to start
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