const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const serverScript = fs.existsSync(path.join(rootDir, 'server/src/server.js'))
  ? path.join(rootDir, 'server/src/server.js')
  : path.join(rootDir, 'Ryvon Bike Rental neww/Ryvon Bike Rental/Ryvon Bike Rental/server/src/server.js');
const viteBin = path.join(rootDir, 'node_modules/vite/bin/vite.js');

console.log('====================================================');
console.log('  🏍️  STARTING RYVON FULL-STACK SYSTEM (Vite + API)  ');
console.log('====================================================');

// Start Node Express Backend on Port 3000
const serverProcess = spawn(process.execPath, [serverScript], {
  cwd: rootDir,
  stdio: 'inherit',
  env: { ...process.env, PORT: '3000' }
});

// Start Vite Dev Server on Port 5173
const viteProcess = spawn(process.execPath, [viteBin], {
  cwd: rootDir,
  stdio: 'inherit'
});

const cleanup = () => {
  console.log('\n🛑 Shutting down RYVON development servers...');
  try { serverProcess.kill(); } catch (e) {}
  try { viteProcess.kill(); } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
