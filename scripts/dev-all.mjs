/**
 * Start everything for local development with live reload:
 *   API      http://localhost:3000
 *   Website  http://localhost:4173
 *   CMS      http://localhost:5173
 *
 * Usage: npm run dev
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const colours = { api: '\x1b[36m', website: '\x1b[33m', cms: '\x1b[35m' };
const reset = '\x1b[0m';

const jobs = [
  { name: 'api', cmd: 'npm run dev -w @gm-safaris/api' },
  { name: 'website', cmd: 'npm run dev -w @gm-safaris/website-com' },
  { name: 'cms', cmd: 'npm run dev -w @gm-safaris/cms' },
];

const children = jobs.map((job) => {
  const child = spawn(job.cmd, { cwd: root, shell: true, env: process.env });
  const tag = `${colours[job.name]}[${job.name}]${reset} `;
  const pipe = (stream, out) => {
    let buffer = '';
    stream.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop();
      for (const line of lines) out.write(`${tag}${line}\n`);
    });
  };
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  child.on('exit', (code) => {
    console.log(`${tag}stopped (${code ?? 0})`);
  });
  return child;
});

console.log(`
  API      http://localhost:3000   (health: /health, docs: /api/v1/docs)
  Website  http://localhost:4173
  CMS      http://localhost:5173
  Press Ctrl+C to stop everything.
`);

function stopAll() {
  for (const child of children) {
    try {
      if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/T', '/F']);
      else child.kill('SIGINT');
    } catch {
      /* already stopped */
    }
  }
  setTimeout(() => process.exit(0), 500);
}
process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
