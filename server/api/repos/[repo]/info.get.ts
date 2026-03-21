import { getDefaultBranch, hasCommits, getTree, getLog, getCreatedAt } from '~/server/utils/git-ops'

export default defineEventHandler(async (event) => {
  const repo = getRouterParam(event, 'repo')!
  const branch = await getDefaultBranch(repo)
  const empty = !(await hasCommits(repo))
  const host = getRequestHeader(event, 'host') || 'localhost:4000'
  const cloneUrl = `http://${host}/${repo}.git`

  const createdAt = getCreatedAt(repo)
  let expiresAt: string | null = null
  if (createdAt) {
    const expires = new Date(createdAt)
    expires.setDate(expires.getDate() + 30)
    expiresAt = expires.toISOString()
  }

  if (empty) {
    return { repo, branch, cloneUrl, tree: [], commits: [], empty: true, currentPath: '', createdAt, expiresAt }
  }

  const tree = await getTree(repo, branch, '')
  const commits = await getLog(repo, branch, 5)
  return { repo, branch, cloneUrl, tree, commits, empty: false, currentPath: '', createdAt, expiresAt }
})
