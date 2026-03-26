<script setup lang="ts">
  import type { PermissionState } from '@/composables/useAudioInput'

  defineProps<{ state: PermissionState }>()
  const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    v-if="state === 'denied' || state === 'unsupported'"
    class="rounded-xl border border-[var(--color-miss)]/40 bg-[var(--color-miss)]/10 px-4 py-3 text-sm"
    role="alert"
  >
    <p
      v-if="state === 'denied'"
      class="text-white"
    >
      Microphone access was denied.
      <span class="text-[var(--color-inactive)]">
        Enable it in your browser's site settings, then try again.
      </span>
    </p>
    <p
      v-else
      class="text-white"
    >
      Microphone not supported in this browser. Use Chrome or Firefox.
    </p>
    <button
      v-if="state === 'denied'"
      class="mt-2 text-xs text-[var(--color-accent)] hover:underline"
      @click="emit('retry')"
    >
      Try again
    </button>
  </div>
</template>
