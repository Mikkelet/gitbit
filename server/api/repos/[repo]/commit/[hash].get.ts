import { getCommit, getDiff } from '~/server/utils/git-ops'

export default defineEventHandler(async (event) => {
  const repo = getRouterParam(event, 'repo')!
  const hash = getRouterParam(event, 'hash')!

  const commit = await getCommit(repo, hash)
  const diff = await getDiff(repo, hash)
  return { repo, commit, diff }
})
