<script setup>
const route = useRoute()
const repo = route.params.repo
const { copy } = useClipboard()

const { data, error } = await useFetch(`/api/repos/${repo}/info`)

if (error.value) {
  throw createError({ statusCode: 404, message: 'Repository not found' })
}

useHead({ title: `${repo} - gitbit` })
</script>

<template>
  <div class="container">
    <h1><NuxtLink :to="`/${repo}`">{{ repo }}</NuxtLink></h1>

    <div v-if="data.expiresAt" class="expiry-notice">
      This repository will be automatically deleted on {{ new Date(data.expiresAt).toLocaleDateString() }}.
    </div>

    <div class="clone-url">
      <span class="clone-label">Clone</span>
      <code>{{ data.cloneUrl }}</code>
      <button class="btn-copy" @click="copy(data.cloneUrl, $event)">Copy</button>
    </div>

    <template v-if="data.empty">
      <div class="empty-repo">
        <p>This repository is empty. Push some code to get started:</p>
        <pre>git clone {{ data.cloneUrl }}
cd {{ repo }}
echo "# {{ repo }}" > README.md
git add README.md
git commit -m "Initial commit"
git push origin main</pre>
      </div>
    </template>

    <template v-else>
      <BreadcrumbNav v-if="data.currentPath" :repo="repo" :branch="data.branch" :path="data.currentPath" />
      <FileTree :repo="repo" :branch="data.branch" :tree="data.tree" />

      <h2>Recent commits</h2>
      <CommitList :repo="repo" :commits="data.commits" />
      <NuxtLink :to="`/${repo}/commits/${data.branch}`">View all commits</NuxtLink>
    </template>
  </div>
</template>
