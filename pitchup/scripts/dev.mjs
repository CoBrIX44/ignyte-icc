import { spawn } from 'node:child_process';
const children = [spawn(process.execPath, ['server/index.mjs'], { stdio: 'inherit' }), spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { stdio: 'inherit' })];
let stopping = false;
function stop(code = 0) { if (stopping) return; stopping = true; children.forEach(c => c.kill()); process.exit(code); }
children.forEach(c => { c.on('error', e => { console.error(e); stop(1); }); c.on('exit', code => { if (!stopping) stop(code ?? 1); }); });
process.on('SIGINT', () => stop()); process.on('SIGTERM', () => stop());
