<script setup lang="ts">
  import { RouterLink } from 'vue-router'
</script>

<template>
  <nav
    class="flex items-center gap-6 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3"
    aria-label="Main navigation"
  >
    <RouterLink
      to="/"
      class="font-mono text-lg font-bold text-[var(--color-accent)] hover:opacity-80 transition-opacity"
      aria-label="GuitarCoach home"
    >
      GuitarCoach
    </RouterLink>

    <div class="flex gap-1 ml-4">
      <RouterLink
        to="/"
        class="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-raised)]"
        :class="{ 'text-white': $route.name === 'home', 'text-[var(--color-inactive)]': $route.name !== 'home' }"
      >
        Dashboard
      </RouterLink>
      <RouterLink
        to="/program"
        class="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-raised)]"
        :class="{ 'text-white': $route.name === 'program', 'text-[var(--color-inactive)]': $route.name !== 'program' }"
      >
        Program
      </RouterLink>
      <RouterLink
        to="/songs"
        class="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-raised)]"
        :class="{ 'text-white': $route.name === 'songs', 'text-[var(--color-inactive)]': $route.name !== 'songs' }"
      >
        Songs
      </RouterLink>
    </div>
  </nav>
</template>
