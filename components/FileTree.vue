<script setup>
defineProps({
  repo: { type: String, required: true },
  branch: { type: String, required: true },
  tree: { type: Array, required: true },
})
</script>

<template>
  <table class="file-tree">
    <tbody>
      <tr v-for="item in tree" :key="item.hash">
        <td class="icon">
          <svg v-if="item.type === 'tree'" aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="#54aeff">
            <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1z"/>
          </svg>
          <svg v-else aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="#848d97">
            <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"/>
          </svg>
        </td>
        <td>
          <NuxtLink v-if="item.type === 'tree'" :to="`/${repo}/tree/${branch}/${item.name}`">{{ item.basename }}</NuxtLink>
          <NuxtLink v-else :to="`/${repo}/blob/${branch}/${item.name}`">{{ item.basename }}</NuxtLink>
        </td>
      </tr>
    </tbody>
  </table>
</template>
