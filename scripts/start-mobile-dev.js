const { exec } = require('child_process');
const os = require('os');

const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';

if (isWindows) {
    exec('start cmd.exe /k "yarn mobile:dev"');
    exec('start cmd.exe /k "node scripts/cross-os-terminal.js \\"yarn server:dev\\""');
} else if (isMac) {
    exec('osascript -e \'tell app "Terminal" to do script "cd \\"$PWD\\" && yarn mobile:dev"\'');
    exec('osascript -e \'tell app "Terminal" to do script "cd \\"$PWD\\" && node scripts/cross-os-terminal.js \\"yarn server:dev\\""\'');
} else {
    // Linux
    exec('x-terminal-emulator -e "yarn mobile:dev"');
    exec('x-terminal-emulator -e "node scripts/cross-os-terminal.js \\"yarn server:dev\\""');
} 