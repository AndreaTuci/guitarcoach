<script setup lang="ts">
  import { computed } from 'vue'
  import type { BeatResult } from '@/types/program'
  import ChordBadge from '@/components/atoms/ChordBadge.vue'

  const props = defineProps<{
    barResults: Map<number, BeatResult>
    exerciseTitle: string
    unlockThreshold: number
    didUnlock: boolean
  }>()

  const emit = defineEmits<{ retry: []; continue: [] }>()

  const results = computed(() => [...props.barResults.values()])

  const tempoAccuracy = computed(() => {
    if (results.value.length === 0) return 0
    const good = results.value.filter((r) => r.accuracy !== 'miss').length
    return Math.round((good / results.value.length) * 100)
  })

  const chordAccuracy = computed(() => {
    const withChord = results.value.filter((r) => r.detectedChord !== null)
    if (withChord.length === 0) return null
    const correct = withChord.filter((r) => r.detectedChord === r.expectedChord).length
    return Math.round((correct / withChord.length) * 100)
  })

  function accuracyColor(pct: number): string {
    if (pct >= 85) return 'var(--color-perfect)'
    if (pct >= 60) return 'var(--color-good)'
    return 'var(--color-miss)'
  }

  const dotColor: Record<string, string> = {
    perfect: '#22c55e',
    good: '#f59e0b',
    miss: '#ef4444',
  }
</script>

<template>
  <div class="space-y-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
    <div>
      <p class="text-xs font-semibold uppercase tracking-widest text-[var(--color-inactive)]">
        Session complete
      </p>
      <h2 class="mt-1 text-xl font-bold text-white">
        {{ exerciseTitle }}
      </h2>
    </div>

    <!-- Accuracy scores -->
    <div class="flex gap-6">
      <div>
        <p class="text-xs text-[var(--color-inactive)]">Timing</p>
        <p
          class="font-mono text-3xl font-bold"
          :style="{ color: accuracyColor(tempoAccuracy) }"
        >
          {{ tempoAccuracy }}%
        </p>
      </div>
      <div v-if="chordAccuracy !== null">
        <p class="text-xs text-[var(--color-inactive)]">Chords</p>
        <p
          class="font-mono text-3xl font-bold"
          :style="{ color: accuracyColor(chordAccuracy) }"
        >
          {{ chordAccuracy }}%
        </p>
      </div>
    </div>

    <!-- Unlock status -->
    <div
      v-if="didUnlock"
      class="rounded-lg border border-[var(--color-perfect)]/30 bg-[var(--color-perfect)]/10 px-4 py-2 text-sm text-[var(--color-perfect)]"
    >
      Next exercise unlocked!
    </div>
    <div
      v-else
      class="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-inactive)]"
    >
      Need {{ Math.round(unlockThreshold * 100) }}% timing accuracy to unlock next exercise.
    </div>

    <!-- Beat timeline -->
    <div>
      <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-inactive)]">
        Bar results
      </p>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="result in results"
          :key="result.beatIndex"
          class="flex flex-col items-center gap-1"
          :title="`Bar ${result.beatIndex + 1}: ${result.accuracy}, Δ${result.timingDeltaMs}ms`"
        >
          <span
            class="h-3 w-3 rounded-full"
            :style="{ backgroundColor: dotColor[result.accuracy] }"
          />
          <ChordBadge
            :chord="result.expectedChord"
            size="sm"
          />
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button
        class="flex-1 rounded-xl border border-[var(--color-border)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-surface-raised)]"
        @click="emit('retry')"
      >
        Retry
      </button>
      <button
        class="flex-1 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        @click="emit('continue')"
      >
        {{ didUnlock ? 'Next Exercise' : 'Continue' }}
      </button>
    </div>
  </div>
</template>
