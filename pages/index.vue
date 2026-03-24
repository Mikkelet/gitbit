<script setup>
useHead({ title: 'gitbit' })

const { data: repos, refresh } = await useFetch('/api/repos')

const generating = ref(false)
const generateResult = ref(null)
const error = ref(null)

async function generateRepo() {
  generating.value = true
  error.value = null
  try {
    const data = await $fetch('/api/repos/generate', { method: 'POST' })
    const remote = 'https://user:' + data.credential + '@' + data.cloneUrl.replace(/^https?:\/\//, '')
    const repoName = data.cloneUrl.split('/').pop()
    generateResult.value = {
      cloneUrl: data.cloneUrl,
      credential: data.credential,
      usage: [
        'git init',
        `echo "# ${repoName}" > README.md`,
        'git add .',
        'git commit -m "Initial commit"',
        `git remote add origin ${remote}`,
        'git push -u origin main',
      ].join('\n'),
    }
    await refresh()
  } catch (err) {
    error.value = 'Failed to generate repository: ' + (err.data?.message || err.message)
  } finally {
    generating.value = false
  }
}
</script>

<template>
  <div class="container">
    <h1>Repositories</h1>

    <div v-if="!generateResult" class="home-actions">
      <button
        class="btn-generate"
        :disabled="generating"
        @click="generateRepo"
      >
        {{ generating ? 'Generating…' : 'Generate Repo' }}
      </button>
    </div>

    <div v-if="generateResult" class="generate-result">
      <div class="generate-result-header">
        <strong>Repository generated</strong>
        <span class="generate-warning">Save the credential now — it will not be shown again.</span>
        <span class="generate-expiry">This repository will be automatically deleted after 30 days.</span>
      </div>
      <CopyField label="Clone URL" :value="generateResult.cloneUrl" />
      <CopyField label="Credential" :value="generateResult.credential" />
      <CopyField label="Usage" :value="generateResult.usage" block />
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <p v-if="!repos?.length" class="empty">No repositories yet. Generate one to get started.</p>

    <table v-else class="repo-list">
      <thead>
        <tr>
          <th>Name</th>
          <th>Last commit</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in repos" :key="r.name">
          <td><NuxtLink :to="`/${r.name}`">{{ r.name }}</NuxtLink></td>
          <td class="date">{{ r.lastCommit || 'empty' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
