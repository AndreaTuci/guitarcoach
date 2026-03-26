import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isMetronomePanelOpen = ref(true)

  function toggleMetronomePanel(): void {
    isMetronomePanelOpen.value = !isMetronomePanelOpen.value
  }

  return {
    isMetronomePanelOpen,
    toggleMetronomePanel,
  }
})
