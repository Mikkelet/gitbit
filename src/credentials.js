const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const config = require('./config');

function credentialsPath() {
  return path.join(config.repoRoot, '.credentials.json');
}

function load() {
  const file = credentialsPath();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function save(data) {
  fs.mkdirSync(config.repoRoot, { recursive: true });
  fs.writeFileSync(credentialsPath(), JSON.stringify(data, null, 2));
}

function hash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(24).toString('base64url');
}

function store(repoId, token) {
  const data = load();
  data[repoId] = hash(token);
  save(data);
}

function verify(repoId, token) {
  const data = load();
  const stored = data[repoId];
  if (!stored) return false;
  return crypto.timingSafeEqual(
    Buffer.from(stored, 'hex'),
    Buffer.from(hash(token), 'hex')
  );
}

function remove(repoId) {
  const data = load();
  delete data[repoId];
  save(data);
}

module.exports = { generateToken, store, verify, remove };
