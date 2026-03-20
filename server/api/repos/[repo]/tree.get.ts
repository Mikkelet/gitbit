import { getTree, getLog } from '~/server/utils/git-ops'

export default defineEventHandler(async (event) => {
  const repo = getRouterParam(event, 'repo')!
  const query = getQuery(event)
  const ref = (query.ref as string) || 'main'
  const dirPath = (query.path as string) || ''

  const tree = await getTree(repo, ref, dirPath)
  const commits = await getLog(repo, ref, 5)
  const host = getRequestHeader(event, 'host') || 'localhost:3000'
  const cloneUrl = `http://${host}/${repo}.git`
  return { repo, branch: ref, cloneUrl, tree, commits, empty: false, currentPath: dirPath }
})
