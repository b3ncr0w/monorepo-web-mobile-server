import chalk from 'chalk';
import { exec } from 'child_process';
import cors from 'cors';
import type { RequestHandler } from 'express';
import express from 'express';
import { networkInterfaces } from 'os';
import readline from 'readline';

const app = express();
const PORT = 3000;

// Add timestamp to logs
function getTimestamp() {
  return new Date().toLocaleTimeString();
}

// Log with timestamp
function log(message: string, withTimestamp = false) {
  const text = withTimestamp 
    ? `[${getTimestamp()}] ${message}`
    : message;
  console.log(text);
}

// Request counter
let requestCount = 0;

const colors = [
  chalk.cyan,
  chalk.magenta,
  chalk.yellow,
  chalk.green,
  chalk.blue
];

app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  requestCount++;
  const color = colors[(requestCount - 1) % colors.length];
  const userAgent = req.get('user-agent') || 'Unknown Client';
  const origin = req.get('origin') || 'Direct Request';
  
  // Track active requests to prevent duplicate logs for retries
  const requestId = `${req.ip}-${Date.now()}`;
  res.locals.requestId = requestId;
  
  // Skip logging for preflight requests
  if (req.method === 'OPTIONS') {
    if (process.env.NODE_ENV === 'development') {
      log(chalk.gray(`🔎 Preflight from ${origin}`), true);
    }
    next();
    return;
  }
  
  let device = '🖥️ Web Browser       ';
  
  if (userAgent.includes('okhttp') || userAgent.includes('Expo') || userAgent.includes('ReactNative')) {
    device = '📱 Native App        ';
  } else if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
    device = '📱 Mobile Browser    ';
  } else if (origin.includes('localhost:5173')) {
    device = '⚡ Web Browser Dev   ';
  }
  
  // Store device info for the response log
  res.locals.device = device;
  res.locals.color = color;
  
  let statusInfo = '';
  if (isPaused) {
    statusInfo = ' 🔌';
  } else if (delayMs > 0) {
    statusInfo = ` ⏳ ${delayMs}ms`;
  }
  
  log(`🔹 ${device} ${color(req.method.padEnd(1) + ' ' + req.path.padEnd(2))}${statusInfo}`, true);
  
  const start = Date.now();
  if (!isPaused) {
    res.on('finish', () => {
      const duration = Date.now() - start;
      log(`🔺 ${res.locals.device} ${res.locals.color(`${res.statusCode.toString().padEnd(4)} ${duration.toString().padStart(2)}ms`)}`, true);
    });
  } else {
    res.on('close', () => {
      log(`⛔ ${res.locals.device} ${res.locals.color('Server is paused')}`, true);
    });
  }
  
  next();
});

let isPaused = false;
let delayMs = 0;

// Function to kill process on port
async function killProcessOnPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`\n❓ Port ${port} is in use. Do you want to force it free? (Y/N) `, async (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'y') {
        const platform = process.platform;
        let findCommand = '';
        
        if (platform === 'win32') {
          findCommand = `for /f "tokens=5" %a in ('netstat -aon ^| find ":${port}" ^| find "LISTENING"') do @echo %a`;
        } else {
          findCommand = `lsof -ti:${port}`;
        }

        exec(findCommand, async (error, stdout) => {
          if (error || !stdout) {
            console.error('❌ Failed to find process:', error?.message || 'No process found');
            resolve(false);
            return;
          }

          const pid = stdout.trim();
          console.log(`Found process: ${pid}`);

          const killCommand = platform === 'win32'
            ? `taskkill /F /PID ${pid}`
            : `kill -9 ${pid}`;

          exec(killCommand, (error) => {
            if (error) {
              console.error('❌ Failed to kill process:', error.message);
              resolve(false);
              return;
            }
            console.log(`\n✅ Successfully killed process ${pid} on port ${port}`);
            // Give the system a moment to free up the port
            setTimeout(() => resolve(true), 1000);
          });
        });
      } else {
        resolve(false);
      }
    });
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (input) => {
  const [command, value] = input.toLowerCase().split(' ');
  
  switch (command) {
    case 'p':
      isPaused = !isPaused;
      log(isPaused ? '🔴 Server Paused' : '🟢 Server Resumed');
      break;
    
    case 'd':
      delayMs = value ? parseInt(value, 10) : 0;
      log(`⏱️ Request delay set to ${delayMs}ms`);
      break;
  }
});

const handleRoot: RequestHandler = (req, res) => {
  if (isPaused) {
    // Simulate server being unresponsive for a while before failing
    const timeout = 2000 + Math.random() * 3000;
    setTimeout(() => {
      // Simulate connection timeout/failure
      res.socket?.destroy();
    }, timeout);
    return;
  }

  if (delayMs > 0) {
    setTimeout(() => {
      res.json({ message: 'API is running' });
    }, delayMs);
    return;
  }
  
  res.json({ message: 'API is running' });
  return;
};

app.get('/', handleRoot);

async function startServer() {
  try {
    const server = app.listen(PORT, () => {
      const nets = networkInterfaces();
      const addresses = [
        { name: 'Local', url: 'localhost' },
        { name: 'Network', url: Object.values(nets)
          .flat()
          .find(addr => addr?.family === 'IPv4' && !addr.internal)
          ?.address || 'unknown' }
      ];

      log('\n🚀 Server started successfully');
      log('📡 Available on:');
      addresses.forEach(({ name, url }) => {
        log(`  ➜ ${name}:   http://${url}:${PORT}`);
      });
      log('\nCommands:');
      log('  "p" - Pause/Resume server');
      log('  "d <ms>" - Set delay in milliseconds (e.g., "d 2000" for 2s delay)');
      log('  "d" - Remove delay');
      log('');
    });

    server.on('error', async (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        const killed = await killProcessOnPort(PORT);
        if (killed) {
          startServer();
        } else {
          console.error(`\n❌ Please free up port ${PORT} manually and try again.`);
          process.exit(1);
        }
      } else {
        throw err;
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();