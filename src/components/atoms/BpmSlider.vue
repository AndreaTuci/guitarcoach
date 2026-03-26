<script setup lang="ts">
  const props = defineProps<{ modelValue: number }>()
  const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

  function onInput(e: Event) {
    emit('update:modelValue', Number((e.target as HTMLInputElement).value))
  }
</script>

<template>
  <input
    type="range"
    :value="props.modelValue"
    min="40"
    max="220"
    step="1"
    class="w-full cursor-pointer accent-[var(--color-accent)]"
    aria-label="BPM"
    @input="onInput"
  />
</template>
