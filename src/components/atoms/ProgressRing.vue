<script setup lang="ts">
  import { computed } from 'vue'

  const props = withDefaults(
    defineProps<{
      percent: number  // 0–100
      size?: number    // px
      strokeWidth?: number
    }>(),
    { size: 64, strokeWidth: 5 },
  )

  const radius = computed(() => (props.size - props.strokeWidth) / 2)
  const circumference = computed(() => 2 * Math.PI * radius.value)
  const offset = computed(() => circumference.value - (props.percent / 100) * circumference.value)
  const center = computed(() => props.size / 2)
</script>

<template>
  <svg :width="props.size" :height="props.size" class="rotate-[-90deg]" aria-hidden="true">
    <!-- Track -->
    <circle
      :cx="center"
      :cy="center"
      :r="radius"
      fill="none"
      stroke="var(--color-border)"
      :stroke-width="props.strokeWidth"
    />
    <!-- Progress -->
    <circle
      :cx="center"
      :cy="center"
      :r="radius"
      fill="none"
      stroke="var(--color-accent)"
      :stroke-width="props.strokeWidth"
      stroke-linecap="round"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="offset"
      style="transition: stroke-dashoffset 0.4s ease"
    />
  </svg>
</template>
