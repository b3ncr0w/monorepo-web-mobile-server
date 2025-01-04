const fs = require('fs');
const path = require('path');
const { findAndroidSdk } = require('./check-android-sdk');

function setupLocalProperties() {
    const sdkPath = findAndroidSdk();
    if (!sdkPath) {
        console.error('❌ Android SDK not found');
        process.exit(1);
    }

    const androidDir = path.join(__dirname, '..', 'apps', 'mobile', 'android');
    const localPropertiesPath = path.join(androidDir, 'local.properties');

    // Only create local.properties if Android directory exists
    if (fs.existsSync(androidDir)) {
        const localPropertiesContent = `sdk.dir=${sdkPath.replace(/\\/g, '/')}`;
        fs.writeFileSync(localPropertiesPath, localPropertiesContent);
        console.log('✅ Created local.properties file');
    } else {
        console.error('❌ Android directory not found. Run prebuild first.');
        process.exit(1);
    }
}

if (require.main === module) {
    setupLocalProperties();
}

module.exports = setupLocalProperties; 