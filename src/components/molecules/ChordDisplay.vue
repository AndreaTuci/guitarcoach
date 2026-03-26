<script setup lang="ts">
  import { computed } from 'vue'
  import type { Chord } from '@/types/program'
  import { CHORD_COLORS } from '@/utils/chordColors'

  const props = defineProps<{
    chord: Chord | null
    confidence: number
  }>()

  const color = computed(() =>
    props.chord ? CHORD_COLORS[props.chord] : 'var(--color-inactive)',
  )

  const confidencePct = computed(() => Math.round(props.confidence * 100))
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <!-- Chord name -->
    <div
      class="flex h-16 w-16 items-center justify-center rounded-2xl font-mono text-2xl font-bold text-white transition-all duration-200"
      :style="{ backgroundColor: color }"
    >
      {{ chord ?? '?' }}
    </div>

    <!-- Confidence bar -->
    <div class="w-16">
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          class="h-full rounded-full transition-all duration-200"
          :style="{ width: `${confidencePct}%`, backgroundColor: color }"
        />
      </div>
      <p class="mt-0.5 text-center font-mono text-xs text-[var(--color-inactive)]">
        {{ confidencePct }}%
      </p>
    </div>
  </div>
</template>
