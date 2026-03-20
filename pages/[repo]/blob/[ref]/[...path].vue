<script setup>
const route = useRoute()
const repo = route.params.repo
const ref = route.params.ref
const filePath = Array.isArray(route.params.path) ? route.params.path.join('/') : route.params.path

const { data, error } = await useFetch(`/api/repos/${repo}/blob`, {
  query: { ref, path: filePath },
})

if (error.value) {
  throw createError({ statusCode: 404, message: error.value.data?.message || 'Not found' })
}

useHead({ title: `${filePath} - ${repo} - gitbit` })
</script>

<template>
  <div class="container">
    <BreadcrumbNav :repo="repo" :branch="ref" :path="filePath" active-leaf />

    <div v-if="data.isBinary" class="binary-notice">
      Binary file ({{ data.size }} bytes)
    </div>
    <div v-else class="code-view">
      <pre><code>{{ data.content }}</code></pre>
    </div>
  </div>
</template>
