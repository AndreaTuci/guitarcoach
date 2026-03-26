<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import type { Ref } from 'vue'
  import type { PermissionState } from '@/composables/useAudioInput'
  import type { OnsetEvent } from '@/types/audio'
  import AudioPermissionBanner from '@/components/atoms/AudioPermissionBanner.vue'

  const props = defineProps<{
    isListening: boolean
    permissionState: PermissionState
    currentRms: number
    lastOnset: OnsetEvent | null
    /** ref to the analyser, unused here but signals when audio is ready */
  }>()

  const emit = defineEmits<{
    start: []
    stop: []
    retry: []
  }>()

  // Flash on each new onset
  const onsetFlash = ref(false)
  watch(
    () => props.lastOnset,
    () => {
      onsetFlash.value = true
      setTimeout(() => (onsetFlash.value = false), 100)
    },
  )

  // Level meter width: map RMS 0–0.5 → 0–100%
  const meterWidth = computed(() => Math.min(100, (props.currentRms / 0.5) * 100))

  // Meter colour shifts from teal → amber → red with level
  const meterColor = computed(() => {
    if (props.currentRms > 0.3) return 'var(--color-miss)'
    if (props.currentRms > 0.15) return 'var(--color-good)'
    return 'var(--color-accent)'
  })
</script>

<template>
  <div class="space-y-2">
    <AudioPermissionBanner
      :state="permissionState"
      @retry="emit('retry')"
    />

    <div class="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
      <!-- Mic toggle button -->
      <button
        class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
        :class="
          isListening
            ? 'bg-[var(--color-miss)]/20 text-[var(--color-miss)] hover:bg-[var(--color-miss)]/30'
            : 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30'
        "
        :aria-label="isListening ? 'Stop microphone' : 'Start microphone'"
        @click="isListening ? emit('stop') : emit('start')"
      >
        <span>{{ isListening ? '⏹' : '🎙' }}</span>
        <span>{{ isListening ? 'Stop mic' : 'Enable mic' }}</span>
      </button>

      <!-- Level meter -->
      <div
        class="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]"
        role="meter"
        :aria-valuenow="Math.round(meterWidth)"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Input level"
      >
        <div
          class="h-full rounded-full transition-all duration-75"
          :style="{ width: `${meterWidth}%`, backgroundColor: meterColor }"
        />
      </div>

      <!-- Onset flash dot -->
      <span
        class="h-3 w-3 rounded-full transition-all duration-75"
        :class="onsetFlash ? 'bg-white scale-125' : 'bg-[var(--color-border)]'"
        aria-hidden="true"
        title="Onset detected"
      />

      <span
        v-if="!isListening && permissionState === 'idle'"
        class="text-xs text-[var(--color-inactive)]"
      >
        Mic off
      </span>
      <span
        v-else-if="permissionState === 'requesting'"
        class="text-xs text-[var(--color-inactive)]"
      >
        Requesting…
      </span>
    </div>
  </div>
</template>
