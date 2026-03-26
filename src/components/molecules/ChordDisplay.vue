<script setup lang="ts">
  import { computed } from 'vue'
  import type { Chord } from '@/types/program'
  import type { StringState } from '@/composables/useChordDetector'
  import { CHORD_COLORS } from '@/utils/chordColors'

  const props = defineProps<{
    chord: Chord | null
    confidence: number
    stringStates?: StringState[]  // 6 elements, index 0 = E2 (thickest)
  }>()

  const color = computed(() =>
    props.chord ? CHORD_COLORS[props.chord] : 'var(--color-inactive)',
  )

  const confidencePct = computed(() => Math.round(props.confidence * 100))

  const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e']

  function dotColor(state: StringState): string {
    if (state === 'sounding') return 'var(--color-perfect)'
    if (state === 'deaf')     return 'var(--color-miss)'
    return 'var(--color-border)'  // muted = neutral grey
  }

  function dotTitle(label: string, state: StringState): string {
    if (state === 'sounding') return `${label}: ringing`
    if (state === 'deaf')     return `${label}: not ringing — press harder`
    return `${label}: muted`
  }
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

    <!-- String status (6 dots, thickest E on left) -->
    <div
      v-if="stringStates && chord"
      class="flex gap-1"
      aria-label="String status"
    >
      <div
        v-for="(state, i) in stringStates"
        :key="i"
        class="flex flex-col items-center gap-0.5"
        :title="dotTitle(STRING_LABELS[i]!, state)"
      >
        <span
          class="block h-2.5 w-2.5 rounded-full transition-colors duration-150"
          :style="{ backgroundColor: dotColor(state) }"
        />
        <span class="font-mono text-[9px] text-[var(--color-inactive)]">
          {{ STRING_LABELS[i] }}
        </span>
      </div>
    </div>
  </div>
</template>
