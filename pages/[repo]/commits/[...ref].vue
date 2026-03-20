<script setup>
const route = useRoute()
const repo = route.params.repo
const ref = Array.isArray(route.params.ref) ? route.params.ref.join('/') : (route.params.ref || '')
const page = parseInt(String(route.query.page || '0')) || 0

const { data, error } = await useFetch(`/api/repos/${repo}/commits`, {
  query: { ref: ref || undefined, page: page || undefined },
})

if (error.value) {
  throw createError({ statusCode: 404, message: error.value.data?.message || 'Not found' })
}

useHead({ title: `Commits - ${repo} - gitbit` })
</script>

<template>
  <div class="container">
    <h1><NuxtLink :to="`/${repo}`">{{ repo }}</NuxtLink> &mdash; Commits</h1>

    <CommitList :repo="repo" :commits="data.commits" />

    <div class="pagination">
      <NuxtLink v-if="page > 0" :to="`/${repo}/commits/${data.branch}?page=${page - 1}`">&larr; Newer</NuxtLink>
      <NuxtLink v-if="data.commits?.length === 30" :to="`/${repo}/commits/${data.branch}?page=${page + 1}`">Older &rarr;</NuxtLink>
    </div>
  </div>
</template>
