import { getBlob } from '~/server/utils/git-ops'

export default defineEventHandler(async (event) => {
  const repo = getRouterParam(event, 'repo')!
  const query = getQuery(event)
  const ref = (query.ref as string) || 'main'
  const filePath = query.path as string

  if (!filePath) {
    throw createError({ statusCode: 400, message: 'File path is required' })
  }

  const content = await getBlob(repo, ref, filePath)
  const isBinary = content.includes('\0')
  return {
    repo,
    branch: ref,
    filePath,
    content: isBinary ? null : content,
    isBinary,
    size: Buffer.byteLength(content),
  }
})
