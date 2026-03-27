<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useMetronomeStore } from '@/stores/metronome'
  import { useUiStore } from '@/stores/ui'
  import MetronomeLane from '@/components/organisms/MetronomeLane.vue'
  import BeatIndicator from '@/components/atoms/BeatIndicator.vue'
  import BpmSlider from '@/components/atoms/BpmSlider.vue'
  import TapTempoButton from '@/components/atoms/TapTempoButton.vue'
  import SubdivisionSelector from '@/components/atoms/SubdivisionSelector.vue'

  const metronome = useMetronomeStore()
  const { bpm, isRunning, currentBeat, beatsPerBar, subdivision, accentBeat1, startAudioTime } =
    storeToRefs(metronome)
  const { toggle, setBpm } = metronome
  const ui = useUiStore()

  function onKeydown(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement).tagName
    if (e.code === 'Space' && tag !== 'INPUT' && tag !== 'BUTTON' && tag !== 'TEXTAREA') {
      e.preventDefault()
      toggle()
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div
    v-show="ui.isMetronomePanelOpen"
    class="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_-4px_24px_rgba(0,0,0,0.5)]"
    role="region"
    aria-label="Metronome"
  >
    <MetronomeLane
      :is-running="isRunning"
      :bpm="bpm"
      :beats-per-bar="beatsPerBar"
      :start-audio-time="startAudioTime"
    />

    <div class="flex items-center gap-4 px-6 py-3">
      <span
        class="w-14 shrink-0 font-mono text-3xl font-bold tabular-nums text-white"
        aria-live="polite"
        aria-label="BPM"
      >
        {{ bpm }}
      </span>

      <div class="min-w-0 flex-1">
        <BpmSlider v-model="bpm" />
      </div>

      <TapTempoButton @bpm="setBpm" />

      <SubdivisionSelector v-model="subdivision" />

      <label class="flex shrink-0 cursor-pointer select-none items-center gap-1.5">
        <input
          v-model="accentBeat1"
          type="checkbox"
          class="accent-[var(--color-accent)]"
          aria-label="Accent beat 1"
        />
        <span class="text-xs text-[var(--color-inactive)]">Accent 1</span>
      </label>

      <BeatIndicator
        :current-beat="currentBeat"
        :beats-per-bar="beatsPerBar"
        :is-running="isRunning"
      />

      <button
        class="shrink-0 rounded-lg px-5 py-2 font-mono text-sm font-semibold transition-opacity hover:opacity-90"
        :class="isRunning ? 'bg-[var(--color-miss)] text-white' : 'bg-[var(--color-accent)] text-black'"
        :aria-label="isRunning ? 'Stop metronome' : 'Start metronome'"
        @click="toggle"
      >
        {{ isRunning ? 'Stop' : 'Start' }}
        <span class="ml-1 text-xs opacity-60">[Space]</span>
      </button>
    </div>
  </div>
</template>
