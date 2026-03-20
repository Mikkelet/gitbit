<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  /** Render value in a <pre> block instead of inline <code> */
  block: { type: Boolean, default: false },
})

const { copy } = useClipboard()
</script>

<template>
  <div class="generate-field">
    <span class="generate-label">{{ label }}</span>
    <div class="copy-row" :class="{ 'copy-row-block': block }">
      <pre v-if="block" style="flex:1;font-family:var(--mono);font-size:13px;line-height:1.6;white-space:pre;overflow-x:auto">{{ value }}</pre>
      <code v-else>{{ value }}</code>
      <button class="btn-copy" :style="block ? 'align-self:flex-start' : ''" @click="copy(value, $event)">Copy</button>
    </div>
  </div>
</template>
