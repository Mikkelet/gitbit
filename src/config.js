const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

let gitHttpBackend;
try {
  const execPath = execFileSync('git', ['--exec-path'], { encoding: 'utf8' }).trim();
  gitHttpBackend = path.join(execPath, 'git-http-backend');
} catch {
  gitHttpBackend = '/Library/Developer/CommandLineTools/usr/libexec/git-core/git-http-backend';
}

module.exports = {
  port: process.env.PORT || 3000,
  repoRoot: process.env.GITBIT_ROOT || path.join(os.homedir(), 'gitbit-repos'),
  gitHttpBackend,
  gitBinary: process.env.GIT_BINARY || 'git',
};
