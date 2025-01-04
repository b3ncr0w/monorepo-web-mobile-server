const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const platform = os.platform();

function crossSpawn(command) {
    if (platform === 'win32') {
        spawn('cmd', ['/c', 'start', 'cmd', '/k', `cd "${projectRoot}" && ${command}`], { shell: true });
    } else if (platform === 'darwin') {
        spawn('osascript', ['-e', `
            tell application "Terminal"
                do script "cd '${projectRoot}' && ${command}"
                activate
            end tell
        `]);
    } else {
        spawn('x-terminal-emulator', ['-e', `cd "${projectRoot}" && ${command}`]);
    }
}

// Handle direct script execution
if (require.main === module) {
    const commands = process.argv.slice(2);
    if (commands.length === 0) {
        console.error('Please provide commands to run');
        process.exit(1);
    }
    commands.forEach(crossSpawn);
}

module.exports = {
    spawn: crossSpawn
};
