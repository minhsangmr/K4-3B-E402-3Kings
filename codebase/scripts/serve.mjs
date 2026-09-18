import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const codebaseRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(codebaseRoot, '..');
const allowedEval = path.join(repoRoot, 'eval', 'golden_set.json');
const publicCodebaseFiles = new Set([
  'index.html',
  'engine.js',
  'ai-decision.js',
  'app.js',
  'eval-tab.js',
  'session-state.js',
]);
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function safeCodebasePath(pathname) {
  const relative = pathname.startsWith('/codebase/') ? pathname.slice('/codebase/'.length) : pathname.slice(1);
  if (!relative || relative === 'codebase') return path.join(codebaseRoot, 'index.html');
  const decoded = decodeURIComponent(relative);
  if (decoded.split('/').some(part => !part || part.startsWith('.'))) return null;
  if (!publicCodebaseFiles.has(decoded)) return null;
  const resolved = path.resolve(codebaseRoot, decoded);
  return resolved.startsWith(codebaseRoot + path.sep) ? resolved : null;
}

export function createAppServer() {
  return http.createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method || '')) {
        response.writeHead(405, { Allow: 'GET, HEAD' }).end();
        return;
      }
      const pathname = new URL(request.url || '/', 'http://localhost').pathname;
      let file = pathname === '/eval/golden_set.json' ? allowedEval : safeCodebasePath(pathname);
      if (!file) {
        response.writeHead(404).end('Not found');
        return;
      }
      const stat = await fs.stat(file).catch(() => null);
      if (!stat?.isFile()) {
        response.writeHead(404).end('Not found');
        return;
      }
      const body = await fs.readFile(file);
      response.writeHead(200, {
        'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch (error) {
      response.writeHead(500).end('Internal server error');
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const host = process.env.HOST || '127.0.0.1';
  const port = Number(process.env.PORT || 8000);
  createAppServer().listen(port, host, () => {
    console.log(`TeachBack Mentor: http://${host}:${port}/`);
  });
}
