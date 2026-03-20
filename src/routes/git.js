const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const credentials = require('../credentials');

const router = express.Router();

function isPushOperation(method, restPath, query) {
  if (method === 'POST' && restPath === '/git-receive-pack') return true;
  if (method === 'GET' && restPath === '/info/refs' && query.includes('service=git-receive-pack')) return true;
  return false;
}

function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Basic ')) return null;
  const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf8');
  const colonIdx = decoded.indexOf(':');
  if (colonIdx === -1) return null;
  return decoded.slice(colonIdx + 1);
}

// Express 5 compatible: use regex-based route matching for git smart HTTP
// Matches: /reponame.git/info/refs, /reponame.git/git-upload-pack, etc.
router.all(/^\/([a-zA-Z0-9._-]+)\.git(\/.*)?$/, (req, res) => {
  const repo = req.params[0];
  const restPath = req.params[1] || '';
  const repoFullPath = path.join(config.repoRoot, repo + '.git');

  if (!fs.existsSync(repoFullPath)) {
    return res.status(404).send('Repository not found');
  }

  const queryString = new URL(req.url, 'http://localhost').search?.slice(1) || '';
  if (isPushOperation(req.method, restPath, queryString)) {
    const token = extractToken(req.headers['authorization']);
    if (!token || !credentials.verify(repo, token)) {
      res.setHeader('WWW-Authenticate', 'Basic realm="gitbit"');
      return res.status(401).send('Unauthorized');
    }
  }

  const urlPath = `/${repo}.git${restPath}`;

  const env = {
    GIT_PROJECT_ROOT: config.repoRoot,
    GIT_HTTP_EXPORT_ALL: '',
    PATH_INFO: urlPath,
    QUERY_STRING: queryString,
    REQUEST_METHOD: req.method,
    CONTENT_TYPE: req.headers['content-type'] || '',
    REMOTE_USER: '',
    REMOTE_ADDR: req.ip,
    SERVER_PROTOCOL: 'HTTP/1.1',
    PATH: process.env.PATH,
  };

  const cgi = spawn(config.gitHttpBackend, [], { env });

  req.pipe(cgi.stdin);

  let headersParsed = false;
  let buffer = Buffer.alloc(0);

  cgi.stdout.on('data', (chunk) => {
    if (headersParsed) {
      res.write(chunk);
      return;
    }

    buffer = Buffer.concat([buffer, chunk]);
    const headerEnd = buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) return;

    const headerStr = buffer.slice(0, headerEnd).toString();
    const body = buffer.slice(headerEnd + 4);
    headersParsed = true;

    const headers = headerStr.split('\r\n');
    for (const header of headers) {
      const colonIdx = header.indexOf(':');
      if (colonIdx === -1) continue;
      const key = header.slice(0, colonIdx).trim();
      const val = header.slice(colonIdx + 1).trim();
      if (key.toLowerCase() === 'status') {
        const code = parseInt(val.split(' ')[0], 10);
        res.status(code);
      } else {
        res.setHeader(key, val);
      }
    }

    if (body.length > 0) {
      res.write(body);
    }
  });

  cgi.stdout.on('end', () => {
    res.end();
  });

  cgi.stderr.on('data', (data) => {
    console.error('git-http-backend stderr:', data.toString());
  });

  cgi.on('error', (err) => {
    console.error('git-http-backend error:', err);
    if (!res.headersSent) {
      res.status(500).send('Internal server error');
    }
  });
});

module.exports = router;
