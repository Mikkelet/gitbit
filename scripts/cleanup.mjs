#!/usr/bin/env node
/**
 * Cleanup script — deletes repositories older than 30 days.
 * Designed to be run via cron inside Docker.
 *
 * Usage: node scripts/cleanup.mjs [maxAgeDays]
 */
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const REPO_ROOT = process.env.GITBIT_ROOT || path.join(process.env.HOME, 'gitbit-repos')
const MAX_AGE_DAYS = Number(process.argv[2]) || 30
const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000

function credentialsPath() {
  return path.join(REPO_ROOT, '.credentials.json')
}

function loadCredentials() {
  const file = credentialsPath()
  if (!fs.existsSync(file)) return {}
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return {} }
}

function saveCredentials(data) {
  fs.writeFileSync(credentialsPath(), JSON.stringify(data, null, 2))
}

function removeCredential(repoId) {
  const data = loadCredentials()
  delete data[repoId]
  saveCredentials(data)
}

if (!fs.existsSync(REPO_ROOT)) {
  console.log('No repo root found, nothing to clean.')
  process.exit(0)
}

const entries = fs.readdirSync(REPO_ROOT, { withFileTypes: true })
const now = Date.now()
let removed = 0

for (const e of entries) {
  if (!e.isDirectory() || !e.name.endsWith('.git')) continue
  const rp = path.join(REPO_ROOT, e.name)
  const createdFile = path.join(rp, '.created')

  let createdAt
  if (fs.existsSync(createdFile)) {
    createdAt = new Date(fs.readFileSync(createdFile, 'utf8').trim()).getTime()
  } else {
    const stat = fs.statSync(rp)
    createdAt = stat.birthtimeMs || stat.ctimeMs
  }

  if (now - createdAt > MAX_AGE_MS) {
    const name = e.name.slice(0, -4)
    fs.rmSync(rp, { recursive: true, force: true })
    removeCredential(name)
    console.log(`Removed: ${name} (created ${new Date(createdAt).toISOString()})`)
    removed++
  }
}

console.log(`Cleanup complete. Removed ${removed} repo(s).`)
