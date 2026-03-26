<script setup lang="ts">
  import type { Subdivision } from '@/composables/useMetronome'

  const props = defineProps<{ modelValue: Subdivision }>()
  const emit = defineEmits<{ 'update:modelValue': [value: Subdivision] }>()

  const options: { value: Subdivision; label: string }[] = [
    { value: 'quarter', label: '♩' },
    { value: 'eighth', label: '♪♪' },
  ]
</script>

<template>
  <div class="flex gap-1" role="group" aria-label="Subdivision">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="rounded px-2 py-1 text-sm font-mono transition-colors"
      :class="
        props.modelValue === opt.value
          ? 'bg-[var(--color-accent)] text-black'
          : 'text-[var(--color-inactive)] hover:text-white'
      "
      :aria-pressed="props.modelValue === opt.value"
      @click="emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
