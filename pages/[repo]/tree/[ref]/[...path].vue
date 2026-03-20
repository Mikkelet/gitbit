<script setup>
const route = useRoute()
const repo = route.params.repo
const ref = route.params.ref
const dirPath = Array.isArray(route.params.path) ? route.params.path.join('/') : route.params.path

const { data, error } = await useFetch(`/api/repos/${repo}/tree`, {
  query: { ref, path: dirPath },
})

if (error.value) {
  throw createError({ statusCode: 404, message: error.value.data?.message || 'Not found' })
}

useHead({ title: `${repo}/${dirPath} - gitbit` })
</script>

<template>
  <div class="container">
    <h1><NuxtLink :to="`/${repo}`">{{ repo }}</NuxtLink></h1>

    <BreadcrumbNav :repo="repo" :branch="ref" :path="dirPath" />
    <FileTree :repo="repo" :branch="ref" :tree="data.tree" />

    <h2>Recent commits</h2>
    <CommitList :repo="repo" :commits="data.commits" />
    <NuxtLink :to="`/${repo}/commits/${data.branch}`">View all commits</NuxtLink>
  </div>
</template>
