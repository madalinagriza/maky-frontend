<template>
  <div class="layout">
    <Navigation />
    <main class="main-content">
      <router-view />
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
  background: radial-gradient(circle at top, #1f2937 0%, #111827 55%, #030712 100%);
  color: #f9fafb;
}

.main-content {
  flex: 1;
  padding: 2rem;
}
</style>

