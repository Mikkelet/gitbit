import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { config } from '~/server/utils/config'
import { verify } from '~/server/utils/credentials'

function isPushOperation(method: string, restPath: string, query: string) {
  if (method === 'POST' && restPath === '/git-receive-pack') return true
  if (method === 'GET' && restPath === '/info/refs' && query.includes('service=git-receive-pack')) return true
  return false
}

function extractToken(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith('Basic ')) return null
  const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf8')
  const colonIdx = decoded.indexOf(':')
  if (colonIdx === -1) return null
  return decoded.slice(colonIdx + 1)
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname
  const match = pathname.match(/^\/([a-zA-Z0-9._-]+)\.git(\/.*)?$/)
  if (!match) return // not a git request, continue to next handler

  const repo = match[1]
  const restPath = match[2] || ''
  const repoFullPath = path.join(config.repoRoot, repo + '.git')

  if (!fs.existsSync(repoFullPath)) {
    throw createError({ statusCode: 404, message: 'Repository not found' })
  }

  const queryString = url.search?.slice(1) || ''
  if (isPushOperation(event.method, restPath, queryString)) {
    const token = extractToken(getRequestHeader(event, 'authorization'))
    if (!token || !verify(repo, token)) {
      setResponseHeader(event, 'WWW-Authenticate', 'Basic realm="gitbit"')
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
  }

  const urlPath = `/${repo}.git${restPath}`

  const env: Record<string, string> = {
    GIT_PROJECT_ROOT: config.repoRoot,
    GIT_HTTP_EXPORT_ALL: '',
    PATH_INFO: urlPath,
    QUERY_STRING: queryString,
    REQUEST_METHOD: event.method,
    CONTENT_TYPE: getRequestHeader(event, 'content-type') || '',
    REMOTE_USER: '',
    REMOTE_ADDR: getRequestIP(event) || '127.0.0.1',
    SERVER_PROTOCOL: 'HTTP/1.1',
    PATH: process.env.PATH || '',
  }

  // Get raw Node.js request/response
  const nodeReq = event.node.req
  const nodeRes = event.node.res

  const cgi = spawn(config.gitHttpBackend, [], { env })

  nodeReq.pipe(cgi.stdin)

  let headersParsed = false
  let buffer = Buffer.alloc(0)

  await new Promise<void>((resolve, reject) => {
    cgi.stdout.on('data', (chunk: Buffer) => {
      if (headersParsed) {
        nodeRes.write(chunk)
        return
      }

      buffer = Buffer.concat([buffer, chunk])
      const headerEnd = buffer.indexOf('\r\n\r\n')
      if (headerEnd === -1) return

      const headerStr = buffer.slice(0, headerEnd).toString()
      const body = buffer.slice(headerEnd + 4)
      headersParsed = true

      const headers = headerStr.split('\r\n')
      for (const header of headers) {
        const colonIdx = header.indexOf(':')
        if (colonIdx === -1) continue
        const key = header.slice(0, colonIdx).trim()
        const val = header.slice(colonIdx + 1).trim()
        if (key.toLowerCase() === 'status') {
          const code = parseInt(val.split(' ')[0], 10)
          nodeRes.statusCode = code
        } else {
          nodeRes.setHeader(key, val)
        }
      }

      if (body.length > 0) {
        nodeRes.write(body)
      }
    })

    cgi.stdout.on('end', () => {
      nodeRes.end()
      resolve()
    })

    cgi.stderr.on('data', (data: Buffer) => {
      console.error('git-http-backend stderr:', data.toString())
    })

    cgi.on('error', (err) => {
      console.error('git-http-backend error:', err)
      if (!nodeRes.headersSent) {
        nodeRes.statusCode = 500
        nodeRes.end('Internal server error')
      }
      reject(err)
    })
  })

  // Signal that we've handled this request
  event._handled = true
})
