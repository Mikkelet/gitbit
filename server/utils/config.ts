import { execFileSync } from 'child_process'
import path from 'path'
import os from 'os'

let gitHttpBackend: string
try {
  const execPath = execFileSync('git', ['--exec-path'], { encoding: 'utf8' }).trim()
  gitHttpBackend = path.join(execPath, 'git-http-backend')
} catch {
  gitHttpBackend = '/Library/Developer/CommandLineTools/usr/libexec/git-core/git-http-backend'
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  repoRoot: process.env.GITBIT_ROOT || path.join(os.homedir(), 'gitbit-repos'),
  gitHttpBackend,
  gitBinary: process.env.GIT_BINARY || 'git',
}
