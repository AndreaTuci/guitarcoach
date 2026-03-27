<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue'
  import { RouterView } from 'vue-router'
  import NavigationBar from '@/components/organisms/NavigationBar.vue'
  import KeyboardShortcutsOverlay from '@/components/organisms/KeyboardShortcutsOverlay.vue'
  import MetronomePanel from '@/components/organisms/MetronomePanel.vue'
  import { useUiStore } from '@/stores/ui'

  const ui = useUiStore()

  async function acquireWakeLock() {
    if (!('wakeLock' in navigator)) return
    try {
      await (navigator as Navigator & { wakeLock: { request(t: string): Promise<void> } }).wakeLock.request('screen')
    } catch {
      // Not supported or denied — fail silently
    }
  }

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

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') acquireWakeLock()
    })
    acquireWakeLock()
    if (window.matchMedia('(display-mode: standalone)').matches) {
      ;(screen.orientation as unknown as { lock?: (o: string) => Promise<void> })
        .lock?.('landscape')
        .catch(() => {})
    }
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
  })
</script>

<template>
  <div class="min-h-screen bg-[var(--color-background)]">
    <NavigationBar />
    <main :class="ui.isMetronomePanelOpen ? 'pb-[216px]' : ''">
      <RouterView />
    </main>
    <KeyboardShortcutsOverlay />
    <MetronomePanel />
  </div>
</template>
