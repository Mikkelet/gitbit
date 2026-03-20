const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('./config');

function repoPath(name) {
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, '');
  return path.join(config.repoRoot, safe + '.git');
}

function git(repo, args) {
  return new Promise((resolve, reject) => {
    execFile(config.gitBinary, args, {
      cwd: repo,
      maxBuffer: 10 * 1024 * 1024,
    }, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve(stdout);
    });
  });
}

async function listRepos() {
  if (!fs.existsSync(config.repoRoot)) return [];
  const entries = fs.readdirSync(config.repoRoot, { withFileTypes: true });
  const repos = [];
  for (const e of entries) {
    if (e.isDirectory() && e.name.endsWith('.git')) {
      const name = e.name.slice(0, -4);
      const rp = path.join(config.repoRoot, e.name);
      let lastCommit = null;
      try {
        const log = await git(rp, ['log', '-1', '--format=%ci']);
        lastCommit = log.trim();
      } catch {}
      repos.push({ name, path: e.name, lastCommit });
    }
  }
  return repos;
}

function createRepo(name) {
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, '');
  if (!safe) throw new Error('Invalid repository name');
  const rp = repoPath(safe);
  if (fs.existsSync(rp)) throw new Error('Repository already exists');
  fs.mkdirSync(config.repoRoot, { recursive: true });
  return new Promise((resolve, reject) => {
    execFile(config.gitBinary, ['init', '--bare', rp], (err) => {
      if (err) return reject(err);
      // Enable push for anonymous users
      execFile(config.gitBinary, ['config', 'http.receivepack', 'true'], { cwd: rp }, (err2) => {
        if (err2) return reject(err2);
        resolve({ name: safe, path: safe + '.git' });
      });
    });
  });
}

async function getDefaultBranch(repo) {
  const rp = repoPath(repo);
  try {
    const head = fs.readFileSync(path.join(rp, 'HEAD'), 'utf8').trim();
    const match = head.match(/^ref: refs\/heads\/(.+)$/);
    return match ? match[1] : 'main';
  } catch {
    return 'main';
  }
}

async function hasCommits(repo) {
  const rp = repoPath(repo);
  try {
    const result = await git(rp, ['rev-parse', '--verify', 'HEAD']);
    // On empty repos, rev-parse may output "HEAD" literally instead of a hash
    return /^[a-f0-9]{40}/.test(result.trim());
  } catch {
    return false;
  }
}

async function getTree(repo, ref, dirPath) {
  const rp = repoPath(repo);
  const target = dirPath ? `${ref}:${dirPath}` : `${ref}`;
  const args = dirPath
    ? ['ls-tree', ref, dirPath + '/']
    : ['ls-tree', ref];
  const output = await git(rp, args);
  return output.trim().split('\n').filter(Boolean).map(line => {
    const match = line.match(/^(\d+)\s+(\w+)\s+([a-f0-9]+)\t(.+)$/);
    if (!match) return null;
    return {
      mode: match[1],
      type: match[2],
      hash: match[3],
      name: match[4],
      basename: path.basename(match[4]),
    };
  }).filter(Boolean).sort((a, b) => {
    if (a.type === 'tree' && b.type !== 'tree') return -1;
    if (a.type !== 'tree' && b.type === 'tree') return 1;
    return a.basename.localeCompare(b.basename);
  });
}

async function getBlob(repo, ref, filePath) {
  const rp = repoPath(repo);
  return git(rp, ['show', `${ref}:${filePath}`]);
}

async function getLog(repo, ref, limit = 30, skip = 0) {
  const rp = repoPath(repo);
  const format = '%H%n%an%n%ae%n%ci%n%s';
  const output = await git(rp, [
    'log', `--format=${format}`, `--skip=${skip}`, `-n`, `${limit}`, ref, '--',
  ]);
  const lines = output.trim().split('\n');
  const commits = [];
  for (let i = 0; i + 4 < lines.length; i += 5) {
    commits.push({
      hash: lines[i],
      shortHash: lines[i].slice(0, 8),
      author: lines[i + 1],
      email: lines[i + 2],
      date: lines[i + 3],
      message: lines[i + 4],
    });
  }
  return commits;
}

async function getCommit(repo, hash) {
  const rp = repoPath(repo);
  const format = '%H%n%an%n%ae%n%ci%n%B';
  const output = await git(rp, ['log', '-1', `--format=${format}`, hash]);
  const lines = output.split('\n');
  const stat = await git(rp, ['diff-tree', '--stat', '--no-commit-id', hash]);
  return {
    hash: lines[0],
    shortHash: lines[0].slice(0, 8),
    author: lines[1],
    email: lines[2],
    date: lines[3],
    message: lines.slice(4).join('\n').trim(),
    stat: stat.trim(),
  };
}

async function getDiff(repo, hash) {
  const rp = repoPath(repo);
  return git(rp, ['diff-tree', '-p', '--no-commit-id', hash]);
}

module.exports = {
  listRepos, createRepo, getDefaultBranch, hasCommits,
  getTree, getBlob, getLog, getCommit, getDiff, repoPath,
};
