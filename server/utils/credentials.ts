import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { config } from './config'

function credentialsPath() {
  return path.join(config.repoRoot, '.credentials.json')
}

function load(): Record<string, string> {
  const file = credentialsPath()
  if (!fs.existsSync(file)) return {}
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return {}
  }
}

function save(data: Record<string, string>) {
  fs.mkdirSync(config.repoRoot, { recursive: true })
  fs.writeFileSync(credentialsPath(), JSON.stringify(data, null, 2))
}

function hash(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateToken() {
  return crypto.randomBytes(24).toString('base64url')
}

export function store(repoId: string, token: string) {
  const data = load()
  data[repoId] = hash(token)
  save(data)
}

export function verify(repoId: string, token: string) {
  const data = load()
  const stored = data[repoId]
  if (!stored) return false
  return crypto.timingSafeEqual(
    Buffer.from(stored, 'hex'),
    Buffer.from(hash(token), 'hex'),
  )
}

export function remove(repoId: string) {
  const data = load()
  delete data[repoId]
  save(data)
}
