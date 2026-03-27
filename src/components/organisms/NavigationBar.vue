<script setup lang="ts">
  import { RouterLink } from 'vue-router'
  import { useUiStore } from '@/stores/ui'

  const ui = useUiStore()
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

    <div class="flex items-center gap-2 ml-auto">
      <button
        class="rounded-md border p-1.5 transition-colors hover:border-[var(--color-accent)] hover:text-white"
        :class="ui.isMetronomePanelOpen
          ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
          : 'border-[var(--color-border)] text-[var(--color-inactive)]'"
        aria-label="Toggle metronome"
        title="Metronome"
        @click="ui.toggleMetronomePanel"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 13 L7 1 L11.5 13" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <line x1="4" y1="13" x2="10" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="7" y1="3.5" x2="10.5" y2="10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>

      <button
        class="rounded-md border border-[var(--color-border)] px-2 py-1 font-mono text-xs text-[var(--color-inactive)] transition-colors hover:border-[var(--color-accent)] hover:text-white"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts"
        @click="ui.toggleShortcuts"
      >
        ?
      </button>
    </div>
  </nav>
</template>
