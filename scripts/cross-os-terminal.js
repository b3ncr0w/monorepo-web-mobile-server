const { spawn } = require('child_process');
const os = require('os');

const command = process.argv[2];

if (!command) {
    console.error('Please provide a command to run');
    process.exit(1);
}

const platform = os.platform();

if (platform === 'win32') {
    spawn('cmd', ['/c', 'start', 'cmd', '/k', command], { shell: true });
} else if (platform === 'darwin') {
    spawn('osascript', ['-e', `tell app "Terminal" to do script "${command}"`]);
} else {
    spawn('x-terminal-emulator', ['-e', command]);
}
