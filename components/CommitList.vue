<script setup>
defineProps({
  repo: { type: String, required: true },
  commits: { type: Array, required: true },
})
</script>

<template>
  <div class="commit-list">
    <div v-for="c in commits" :key="c.hash" class="commit-entry">
      <NuxtLink :to="`/${repo}/commit/${c.hash}`" class="commit-hash">{{ c.shortHash }}</NuxtLink>
      <span class="commit-msg">{{ c.message }}</span>
      <span class="commit-meta">{{ c.author }} &middot; {{ c.date }}</span>
    </div>
  </div>
</template>
