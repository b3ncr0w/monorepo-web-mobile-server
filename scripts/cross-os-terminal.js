const { spawn } = require('child_process');
const os = require('os');

const commands = process.argv.slice(2);

if (commands.length === 0) {
    console.error('Please provide commands to run');
    process.exit(1);
}

const platform = os.platform();

commands.forEach(command => {
    if (platform === 'win32') {
        spawn('cmd', ['/c', 'start', 'cmd', '/k', command], { shell: true });
    } else if (platform === 'darwin') {
        spawn('osascript', ['-e', `tell app "Terminal" to do script "${command}"`]);
    } else {
        spawn('x-terminal-emulator', ['-e', command]);
    }
});
