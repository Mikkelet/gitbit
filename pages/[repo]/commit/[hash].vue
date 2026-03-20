<script setup>
const route = useRoute()
const repo = route.params.repo
const hash = route.params.hash

const { data, error } = await useFetch(`/api/repos/${repo}/commit/${hash}`)

if (error.value) {
  throw createError({ statusCode: 404, message: error.value.data?.message || 'Not found' })
}

useHead({ title: `${data.value.commit.shortHash} - ${repo} - gitbit` })

function diffLineClass(line) {
  if (line.startsWith('+') && !line.startsWith('+++')) return 'diff-add'
  if (line.startsWith('-') && !line.startsWith('---')) return 'diff-del'
  if (line.startsWith('@@')) return 'diff-hunk'
  return 'diff-ctx'
}
</script>

<template>
  <div class="container">
    <h1><NuxtLink :to="`/${repo}`">{{ repo }}</NuxtLink> &mdash; Commit {{ data.commit.shortHash }}</h1>

    <div class="commit-detail">
      <div class="meta-row">
        <span class="label">Author</span>
        <strong>{{ data.commit.author }}</strong>
        <span style="color:var(--text-muted)">&lt;{{ data.commit.email }}&gt;</span>
      </div>
      <div class="meta-row">
        <span class="label">Date</span>
        <span class="date">{{ data.commit.date }}</span>
      </div>
      <div class="commit-message">{{ data.commit.message }}</div>
    </div>

    <template v-if="data.commit.stat">
      <h3>Changed files</h3>
      <pre class="stat">{{ data.commit.stat }}</pre>
    </template>

    <template v-if="data.diff">
      <h3>Diff</h3>
      <div class="diff-view">
        <div v-for="(line, i) in data.diff.split('\n')" :key="i" :class="diffLineClass(line)">{{ line }}</div>
      </div>
    </template>
  </div>
</template>
