<script setup>
const props = defineProps({
  error: Object,
})
</script>

<template>
  <div>
    <nav class="topnav">
      <NuxtLink to="/" class="logo">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="5" cy="4" r="2" stroke="white" stroke-width="1.5"/>
          <circle cx="5" cy="16" r="2" stroke="white" stroke-width="1.5"/>
          <circle cx="15" cy="4" r="2" stroke="white" stroke-width="1.5"/>
          <line x1="5" y1="6" x2="5" y2="14" stroke="white" stroke-width="1.5"/>
          <path d="M5 4 Q5 11 15 4" stroke="white" stroke-width="1.5" fill="none"/>
        </svg>
        gitbit
      </NuxtLink>
    </nav>
    <main>
      <div class="container">
        <h1>Error</h1>
        <p>{{ error?.message || 'Something went wrong' }}</p>
        <NuxtLink to="/">Back to home</NuxtLink>
      </div>
    </main>
  </div>
</template>
