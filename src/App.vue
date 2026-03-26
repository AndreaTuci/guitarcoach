<script setup lang="ts">
  import { RouterView } from 'vue-router'
  import NavigationBar from '@/components/organisms/NavigationBar.vue'
</script>

<template>
  <div class="min-h-screen bg-[var(--color-background)]">
    <NavigationBar />
    <RouterView />
  </div>
</template>
