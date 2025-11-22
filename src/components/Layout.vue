<template>
  <div class="layout">
    <Navigation />
    <main class="main-content">
        <slot />
      </main>
  </div>
</template>

<script setup lang="ts">
import Navigation from './Navigation.vue'
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--app-bg);
  color: #f9fafb;
}

.main-content {
  flex: 1;
  padding: 2rem;
}
</style>

