import { getDefaultBranch, hasCommits, getTree, getLog } from '~/server/utils/git-ops'

export default defineEventHandler(async (event) => {
  const repo = getRouterParam(event, 'repo')!
  const branch = await getDefaultBranch(repo)
  const empty = !(await hasCommits(repo))
  const host = getRequestHeader(event, 'host') || 'localhost:3000'
  const cloneUrl = `http://${host}/${repo}.git`

  if (empty) {
    return { repo, branch, cloneUrl, tree: [], commits: [], empty: true, currentPath: '' }
  }

  const tree = await getTree(repo, branch, '')
  const commits = await getLog(repo, branch, 5)
  return { repo, branch, cloneUrl, tree, commits, empty: false, currentPath: '' }
})
