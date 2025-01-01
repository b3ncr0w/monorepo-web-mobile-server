const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

const commands = process.argv.slice(2);

if (commands.length === 0) {
    console.error('Please provide commands to run');
    process.exit(1);
}

const projectRoot = path.resolve(__dirname, '..');
const platform = os.platform();

commands.forEach(command => {
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
});
