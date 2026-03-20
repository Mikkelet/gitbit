import { getDefaultBranch, getLog } from '~/server/utils/git-ops'

export default defineEventHandler(async (event) => {
  const repo = getRouterParam(event, 'repo')!
  const query = getQuery(event)
  const ref = (query.ref as string) || await getDefaultBranch(repo)
  const page = parseInt(query.page as string) || 0

  const commits = await getLog(repo, ref, 30, page * 30)
  return { repo, branch: ref, commits, page }
})
