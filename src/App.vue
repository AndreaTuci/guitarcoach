<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue'
  import { RouterView } from 'vue-router'
  import NavigationBar from '@/components/organisms/NavigationBar.vue'
  import KeyboardShortcutsOverlay from '@/components/organisms/KeyboardShortcutsOverlay.vue'
  import { useUiStore } from '@/stores/ui'

  const ui = useUiStore()

  function onKeydown(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement).tagName
    if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'TEXTAREA') return

    if (e.key === '?') {
      e.preventDefault()
      ui.toggleShortcuts()
    } else if (e.key === 'Escape' && ui.isShortcutsOpen) {
      ui.closeShortcuts()
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="min-h-screen bg-[var(--color-background)]">
    <NavigationBar />
    <main>
      <RouterView />
    </main>
    <KeyboardShortcutsOverlay />
  </div>
</template>
