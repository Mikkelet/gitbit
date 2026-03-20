<script setup>
const props = defineProps({
  repo: { type: String, required: true },
  branch: { type: String, required: true },
  path: { type: String, required: true },
  /** If true, last segment is rendered as bold text instead of a link */
  activeLeaf: { type: Boolean, default: false },
})

const parts = computed(() => props.path.split('/').filter(Boolean))
</script>

<template>
  <div class="breadcrumb">
    <NuxtLink :to="`/${repo}`">{{ repo }}</NuxtLink>
    <template v-for="(part, i) in parts" :key="i">
      <span class="sep">/</span>
      <strong v-if="activeLeaf && i === parts.length - 1">{{ part }}</strong>
      <NuxtLink v-else :to="`/${repo}/tree/${branch}/${parts.slice(0, i + 1).join('/')}`">{{ part }}</NuxtLink>
    </template>
  </div>
</template>
