import { createRepo } from '~/server/utils/git-ops'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body?.name) {
    throw createError({ statusCode: 400, message: 'Name is required' })
  }
  const host = getRequestHeader(event, 'host') || 'localhost:4000'
  const repo = await createRepo(body.name)
  return {
    ...repo,
    cloneUrl: `https://${host}/${repo.path}`,
  }
})
