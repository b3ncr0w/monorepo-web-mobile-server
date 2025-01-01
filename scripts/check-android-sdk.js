const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

function findAndroidSdk() {
  const homeDir = os.homedir();
  const possiblePaths = [
    '/opt/homebrew/share/android-commandlinetools',  // Homebrew Android SDK location
    path.join(homeDir, 'Library/Android/sdk'),      // macOS default
    path.join(homeDir, 'AppData/Local/Android/Sdk'), // Windows
    path.join(homeDir, 'Android/Sdk'),              // Linux
  ];

  // Check ANDROID_HOME env variable first
  if (process.env.ANDROID_HOME && fs.existsSync(process.env.ANDROID_HOME)) {
    return process.env.ANDROID_HOME;
  }

  // Check ANDROID_SDK_ROOT env variable
  if (process.env.ANDROID_SDK_ROOT && fs.existsSync(process.env.ANDROID_SDK_ROOT)) {
    return process.env.ANDROID_SDK_ROOT;
  }

  // Check common locations
  for (const sdkPath of possiblePaths) {
    if (fs.existsSync(sdkPath)) {
      return sdkPath;
    }
  }

  return null;
}

async function installAndroidSdk() {
  const platform = os.platform();
  
  if (platform === 'darwin') {
    try {
      // Check if Homebrew is installed
      try {
        execSync('which brew');
      } catch {
        console.log('📦 Installing Homebrew...');
        execSync('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
      }

      // Install Java if needed
      try {
        execSync('java -version');
      } catch {
        console.log('☕️ Installing Java...');
        execSync('brew install --cask temurin', { stdio: 'inherit' });
      }

      console.log('📱 Installing Android Command Line Tools...');
      execSync('brew install --cask android-commandlinetools', { stdio: 'inherit' });
      
      // Set up environment variables
      const shellType = process.env.SHELL?.includes('zsh') ? 'zsh' : 'bash';
      const rcFile = shellType === 'zsh' ? '.zshrc' : '.bash_profile';
      const rcPath = path.join(os.homedir(), rcFile);
      
      const envSetup = `
# Android SDK
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
`;

      fs.appendFileSync(rcPath, envSetup);
      
      // Set ANDROID_HOME for the current process
      process.env.ANDROID_HOME = '/opt/homebrew/share/android-commandlinetools';
      
      // Accept licenses and install required SDK components
      const sdkmanager = '/opt/homebrew/bin/sdkmanager';
      console.log('📱 Installing Android SDK components...');
      
      execSync(`yes | ${sdkmanager} --licenses`, { stdio: 'inherit' });
      execSync(`${sdkmanager} \
        "platform-tools" \
        "platforms;android-34" \
        "build-tools;34.0.0" \
        "ndk;26.1.10909125" \
        "cmake;3.22.1"`, { stdio: 'inherit' });

      return true;
    } catch (error) {
      console.error('❌ Failed to install Android SDK:', error.message);
      return false;
    }
  } else {
    console.error('❌ Automatic installation is only supported on macOS');
    return false;
  }
}

async function checkAndroidSdk() {
  let sdkPath = findAndroidSdk();

  if (!sdkPath) {
    console.log('📱 Android SDK not found. Installing...');
    const installed = await installAndroidSdk();
    if (!installed) {
      process.exit(1);
    }
    sdkPath = findAndroidSdk();
  }

  // Check for essential SDK components
  const requiredTools = ['platform-tools', 'build-tools'];
  const missingTools = [];

  for (const tool of requiredTools) {
    if (!fs.existsSync(path.join(sdkPath, tool))) {
      missingTools.push(tool);
    }
  }

  if (missingTools.length > 0) {
    console.log('📱 Installing missing SDK components...');
    await installAndroidSdk();
  }

  console.log('✅ Android SDK is properly configured');
}

checkAndroidSdk(); 