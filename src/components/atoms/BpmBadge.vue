<script setup lang="ts">
  defineProps<{ bpm: number }>()
</script>

<template>
  <span class="font-mono text-sm text-[var(--color-inactive)]">
    <span class="text-[var(--color-accent)]">{{ bpm }}</span> BPM
  </span>
</template>
