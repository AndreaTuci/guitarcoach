import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isMetronomePanelOpen = ref(true)
  const isShortcutsOpen = ref(false)

  function toggleMetronomePanel(): void {
    isMetronomePanelOpen.value = !isMetronomePanelOpen.value
  }

  function toggleShortcuts(): void {
    isShortcutsOpen.value = !isShortcutsOpen.value
  }

  function closeShortcuts(): void {
    isShortcutsOpen.value = false
  }

  return {
    isMetronomePanelOpen,
    isShortcutsOpen,
    toggleMetronomePanel,
    toggleShortcuts,
    closeShortcuts,
  }
})
