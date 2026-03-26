<script setup lang="ts">
  import { ref, watch } from 'vue'

  const props = defineProps<{
    currentBeat: number
    beatsPerBar: number
    isRunning: boolean
  }>()

  // Which beat index is currently flashing
  const flashingBeat = ref(-1)

  watch(
    () => props.currentBeat,
    (beat) => {
      if (!props.isRunning) return
      flashingBeat.value = beat
      // Clear flash after animation completes
      setTimeout(() => {
        if (flashingBeat.value === beat) flashingBeat.value = -1
      }, 120)
    },
  )
</script>

<template>
  <div class="flex items-center gap-1.5" role="status" aria-label="Beat indicator">
    <span
      v-for="i in beatsPerBar"
      :key="i"
      class="h-2.5 w-2.5 rounded-full transition-all duration-75"
      :class="[
        flashingBeat === i - 1
          ? i === 1
            ? 'bg-[var(--color-accent)] scale-125'
            : 'bg-white scale-110'
          : 'bg-[var(--color-border)]',
      ]"
    />
  </div>
</template>
