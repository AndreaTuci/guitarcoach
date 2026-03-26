<script setup lang="ts">
  import type { Chord } from '@/types/program'
  import { CHORD_COLORS } from '@/utils/chordColors'

  const props = withDefaults(
    defineProps<{
      chord: Chord
      size?: 'sm' | 'md' | 'lg'
    }>(),
    { size: 'md' },
  )

  const sizeClasses: Record<string, string> = {
    sm: 'text-xs px-1.5 py-0.5 rounded',
    md: 'text-sm px-2.5 py-1 rounded-md',
    lg: 'text-base px-3 py-1.5 rounded-lg',
  }
</script>

<template>
  <span
    class="inline-block font-mono font-bold text-white"
    :class="sizeClasses[props.size]"
    :style="{ backgroundColor: CHORD_COLORS[props.chord] }"
  >
    {{ props.chord }}
  </span>
</template>
