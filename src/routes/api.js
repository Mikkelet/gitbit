const express = require('express');
const crypto = require('crypto');
const { listRepos, createRepo } = require('../git-ops');
const credentials = require('../credentials');

const router = express.Router();

router.get('/repos', async (req, res) => {
  try {
    const repos = await listRepos();
    res.json(repos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/repos', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const repo = await createRepo(name);
    const host = req.headers.host || 'localhost:3000';
    repo.cloneUrl = `http://${host}/${repo.path}`;
    res.status(201).json(repo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/repos/generate', async (req, res) => {
  try {
    const repoId = crypto.randomUUID();
    const repo = await createRepo(repoId);
    const token = credentials.generateToken();
    credentials.store(repoId, token);
    const host = req.headers.host || 'localhost:3000';
    res.status(201).json({
      repoId,
      credential: token,
      cloneUrl: `http://${host}/${repo.path}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
