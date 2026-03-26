<script setup lang="ts">
  import type { Phase } from '@/types/program'

  defineProps<{ phase: Phase; completedCount: number; totalCount: number }>()
</script>

<template>
  <div class="mb-2 flex items-baseline gap-4">
    <span class="font-mono text-xs text-[var(--color-accent)]">PHASE {{ phase.phaseNumber }}</span>
    <h2 class="text-lg font-semibold text-white">{{ phase.title }}</h2>
    <span class="ml-auto font-mono text-xs text-[var(--color-inactive)]">
      {{ completedCount }} / {{ totalCount }}
    </span>
  </div>
  <p class="mb-6 text-sm text-[var(--color-inactive)]">{{ phase.description }}</p>
</template>
