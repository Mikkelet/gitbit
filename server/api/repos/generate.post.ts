import crypto from 'crypto'
import { createRepo } from '~/server/utils/git-ops'
import { generateToken, store } from '~/server/utils/credentials'

export default defineEventHandler(async (event) => {
  const repoId = crypto.randomUUID()
  const repo = await createRepo(repoId)
  const token = generateToken()
  store(repoId, token)
  const host = getRequestHeader(event, 'host') || 'localhost:4000'
  return {
    repoId,
    credential: token,
    cloneUrl: `http://${host}/${repo.path}`,
  }
})
