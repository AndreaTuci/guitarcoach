<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue'
  import { useMetronomeStore } from '@/stores/metronome'
  import { useUiStore } from '@/stores/ui'
  import BeatIndicator from '@/components/atoms/BeatIndicator.vue'
  import BpmSlider from '@/components/atoms/BpmSlider.vue'
  import TapTempoButton from '@/components/atoms/TapTempoButton.vue'
  import SubdivisionSelector from '@/components/atoms/SubdivisionSelector.vue'

  const { bpm, isRunning, currentBeat, beatsPerBar, subdivision, accentBeat1, toggle, setBpm } =
    useMetronomeStore()
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
    class="fixed bottom-5 right-5 z-50 w-60 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
    role="region"
    aria-label="Metronome"
  >
    <div class="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
      <span class="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--color-inactive)]">
        Metronome
      </span>
      <button
        class="text-xs text-[var(--color-inactive)] hover:text-white transition-colors"
        :aria-label="ui.isMetronomePanelOpen ? 'Collapse metronome' : 'Expand metronome'"
        @click="ui.toggleMetronomePanel"
      >
        {{ ui.isMetronomePanelOpen ? '▾' : '▸' }}
      </button>
    </div>

    <div
      v-show="ui.isMetronomePanelOpen"
      class="px-4 py-4 space-y-4"
    >
      <div class="flex items-center justify-between">
        <span
          class="font-mono text-4xl font-bold text-white tabular-nums"
          aria-live="polite"
          aria-label="BPM"
        >
          {{ bpm }}
        </span>
        <BeatIndicator
          :current-beat="currentBeat"
          :beats-per-bar="beatsPerBar"
          :is-running="isRunning"
        />
      </div>

      <BpmSlider v-model="bpm" />

      <div class="flex items-center justify-between gap-2">
        <TapTempoButton @bpm="setBpm" />
        <SubdivisionSelector v-model="subdivision" />
      </div>

      <label class="flex cursor-pointer select-none items-center gap-2">
        <input
          v-model="accentBeat1"
          type="checkbox"
          class="accent-[var(--color-accent)]"
          aria-label="Accent beat 1"
        />
        <span class="text-xs text-[var(--color-inactive)]">Accent beat 1</span>
      </label>

      <button
        class="w-full rounded-lg py-2 font-mono text-sm font-semibold transition-opacity hover:opacity-90"
        :class="isRunning ? 'bg-[var(--color-miss)] text-white' : 'bg-[var(--color-accent)] text-black'"
        :aria-label="isRunning ? 'Stop metronome' : 'Start metronome'"
        @click="toggle"
      >
        {{ isRunning ? 'Stop' : 'Start' }}
        <span class="ml-2 text-xs opacity-60">[Space]</span>
      </button>
    </div>
  </div>
</template>
