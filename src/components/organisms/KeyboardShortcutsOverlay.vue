<script setup lang="ts">
  import { useUiStore } from '@/stores/ui'

  const ui = useUiStore()

  const shortcuts = [
    { key: 'Space', description: 'Toggle metronome' },
    { key: '?', description: 'Show / hide this overlay' },
  ]
</script>

<template>
  <Transition name="overlay">
    <div
      v-if="ui.isShortcutsOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      @click.self="ui.closeShortcuts"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <!-- Panel -->
      <div class="relative w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="font-mono text-sm font-semibold uppercase tracking-widest text-[var(--color-inactive)]">
            Keyboard Shortcuts
          </h2>
          <button
            class="text-[var(--color-inactive)] hover:text-white transition-colors"
            aria-label="Close shortcuts overlay"
            @click="ui.closeShortcuts"
          >
            ✕
          </button>
        </div>

        <dl class="space-y-3">
          <div
            v-for="shortcut in shortcuts"
            :key="shortcut.key"
            class="flex items-center justify-between gap-4"
          >
            <dt class="text-sm text-[var(--color-inactive)]">{{ shortcut.description }}</dt>
            <dd>
              <kbd class="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2.5 py-1 font-mono text-xs text-white">
                {{ shortcut.key }}
              </kbd>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.15s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
