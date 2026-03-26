<script setup lang="ts">
  import { ref } from 'vue'
  import { useTapTempo } from '@/composables/useTapTempo'

  const emit = defineEmits<{ bpm: [value: number] }>()

  const { tap } = useTapTempo()
  const isActive = ref(false)

  function onTap() {
    const bpm = tap()
    if (bpm !== null) emit('bpm', bpm)

    // Brief visual flash
    isActive.value = true
    setTimeout(() => (isActive.value = false), 100)
  }
</script>

<template>
  <button
    class="rounded-md border px-3 py-1.5 text-xs font-mono transition-colors"
    :class="
      isActive
        ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black'
        : 'border-[var(--color-border)] text-[var(--color-inactive)] hover:border-[var(--color-accent)] hover:text-white'
    "
    aria-label="Tap to set BPM"
    @click="onTap"
  >
    TAP
  </button>
</template>
