const fs = require('fs');
const path = require('path');

function moveAndroidBuild() {
  const sourceDir = path.join(__dirname, '../apps/mobile/android/app/build/outputs/apk/release');
  const targetDir = path.join(__dirname, '../dist/mobile');

  // Create dist/android directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy APK file
  const apkFile = 'app-release.apk';
  const sourcePath = path.join(sourceDir, apkFile);
  const targetPath = path.join(targetDir, apkFile);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Successfully copied Android build to ${targetDir}`);
  } else {
    console.error('❌ Could not find Android build output. Make sure the build completed successfully.');
    process.exit(1);
  }
}

moveAndroidBuild(); 