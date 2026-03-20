import { listRepos } from '~/server/utils/git-ops'

export default defineEventHandler(async () => {
  return await listRepos()
})
