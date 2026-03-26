<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import type { Exercise } from '@/types/program'
  import ChordBadge from '@/components/atoms/ChordBadge.vue'
  import BpmBadge from '@/components/atoms/BpmBadge.vue'
  import LockIcon from '@/components/atoms/LockIcon.vue'

  const props = defineProps<{
    exercise: Exercise
    isUnlocked: boolean
    isCompleted: boolean
  }>()

  const router = useRouter()

  // Show at most 6 chord badges; if there are more, show a "+N" label
  const visibleChords = computed(() => props.exercise.chordSequence.slice(0, 6))
  const extraChords = computed(() => Math.max(0, props.exercise.chordSequence.length - 6))

  function open() {
    if (!props.isUnlocked) return
    router.push({ name: 'exercise', params: { id: props.exercise.id } })
  }
</script>

<template>
  <button
    class="group relative w-full rounded-xl border p-4 text-left transition-all"
    :class="[
      isUnlocked
        ? 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-raised)] cursor-pointer'
        : 'border-[var(--color-border)] bg-[var(--color-surface)] opacity-50 cursor-not-allowed',
      isCompleted && 'border-[var(--color-perfect)]/30',
    ]"
    :disabled="!isUnlocked"
    @click="open"
  >
    <!-- Completed indicator -->
    <span
      v-if="isCompleted"
      class="absolute right-3 top-3 h-2 w-2 rounded-full bg-[var(--color-perfect)]"
      aria-label="Completed"
    />

    <!-- Lock overlay -->
    <span
      v-if="!isUnlocked"
      class="absolute right-3 top-3 text-[var(--color-inactive)]"
    >
      <LockIcon :size="14" />
    </span>

    <p class="mb-1 text-sm font-semibold text-white">{{ exercise.title }}</p>
    <p class="mb-3 text-xs text-[var(--color-inactive)] line-clamp-1">{{ exercise.description }}</p>

    <div class="flex items-center gap-3">
      <BpmBadge :bpm="exercise.bpm" />
      <span class="text-[var(--color-inactive)] text-xs">{{ exercise.bars }} bars</span>
    </div>

    <div class="mt-3 flex flex-wrap gap-1.5">
      <ChordBadge
        v-for="(chord, i) in visibleChords"
        :key="i"
        :chord="chord"
        size="sm"
      />
      <span v-if="extraChords > 0" class="text-xs text-[var(--color-inactive)] self-center">
        +{{ extraChords }}
      </span>
    </div>
  </button>
</template>
