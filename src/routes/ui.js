const express = require('express');
const ops = require('../git-ops');

const router = express.Router();

router.get('/', async (req, res) => {
  const repos = await ops.listRepos();
  res.render('home', { repos, error: null });
});

router.post('/new', async (req, res) => {
  try {
    const { name } = req.body;
    await ops.createRepo(name);
    res.redirect('/');
  } catch (err) {
    const repos = await ops.listRepos();
    res.render('home', { repos, error: err.message });
  }
});

router.get('/:repo', async (req, res) => {
  try {
    const { repo } = req.params;
    const branch = await ops.getDefaultBranch(repo);
    const empty = !(await ops.hasCommits(repo));
    const host = req.headers.host || 'localhost:3000';
    const cloneUrl = `http://${host}/${repo}.git`;

    if (empty) {
      return res.render('repo', { repo, branch, cloneUrl, tree: [], commits: [], empty: true, currentPath: '' });
    }

    const tree = await ops.getTree(repo, branch, '');
    const commits = await ops.getLog(repo, branch, 5);
    res.render('repo', { repo, branch, cloneUrl, tree, commits, empty: false, currentPath: '' });
  } catch (err) {
    res.status(404).render('error', { message: 'Repository not found' });
  }
});

router.get('/:repo/tree/:ref/*', async (req, res) => {
  try {
    const { repo, ref } = req.params;
    const dirPath = req.params[0];
    const tree = await ops.getTree(repo, ref, dirPath);
    const commits = await ops.getLog(repo, ref, 5);
    const cloneUrl = `http://${req.headers.host}/${repo}.git`;
    res.render('repo', { repo, branch: ref, cloneUrl, tree, commits, empty: false, currentPath: dirPath });
  } catch (err) {
    res.status(404).render('error', { message: err.message });
  }
});

router.get('/:repo/blob/:ref/*', async (req, res) => {
  try {
    const { repo, ref } = req.params;
    const filePath = req.params[0];
    const content = await ops.getBlob(repo, ref, filePath);
    // Detect binary
    const isBinary = content.includes('\0');
    res.render('blob', { repo, branch: ref, filePath, content: isBinary ? null : content, isBinary, size: Buffer.byteLength(content) });
  } catch (err) {
    res.status(404).render('error', { message: err.message });
  }
});

router.get('/:repo/commits/:ref?', async (req, res) => {
  try {
    const { repo } = req.params;
    const ref = req.params.ref || await ops.getDefaultBranch(repo);
    const page = parseInt(req.query.page) || 0;
    const commits = await ops.getLog(repo, ref, 30, page * 30);
    res.render('commits', { repo, branch: ref, commits, page });
  } catch (err) {
    res.status(404).render('error', { message: err.message });
  }
});

router.get('/:repo/commit/:hash', async (req, res) => {
  try {
    const { repo, hash } = req.params;
    const commit = await ops.getCommit(repo, hash);
    const diff = await ops.getDiff(repo, hash);
    res.render('commit', { repo, commit, diff });
  } catch (err) {
    res.status(404).render('error', { message: err.message });
  }
});

module.exports = router;
