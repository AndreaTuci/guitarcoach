<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useProgramStore } from '@/stores/program'
  import { useAudioInput } from '@/composables/useAudioInput'
  import { useOnsetDetector } from '@/composables/useOnsetDetector'
  import { useChordDetector } from '@/composables/useChordDetector'
  import { useExerciseSession } from '@/composables/useExerciseSession'
  import ChordBadge from '@/components/atoms/ChordBadge.vue'
  import BpmBadge from '@/components/atoms/BpmBadge.vue'
  import MetronomePanel from '@/components/organisms/MetronomePanel.vue'
  import AudioStatusBar from '@/components/organisms/AudioStatusBar.vue'
  import ChordDisplay from '@/components/molecules/ChordDisplay.vue'
  import BeatLane from '@/components/organisms/BeatLane.vue'
  import SessionSummary from '@/components/organisms/SessionSummary.vue'
  import type { Stroke } from '@/types/program'

  const route = useRoute()
  const router = useRouter()
  const store = useProgramStore()

  const exercise = computed(() => store.getExerciseById(route.params.id as string))

  // Audio pipeline
  const { isListening, permissionState, analyserNode, start: startMic, stop: stopMic } =
    useAudioInput()
  const { lastOnset, currentRms } = useOnsetDetector(analyserNode)
  const { detectedChord, confidence } = useChordDetector(analyserNode)

  // Session
  const session = useExerciseSession(exercise, lastOnset, detectedChord)

  // Track whether this session unlocked the next exercise
  const didUnlock = computed(() =>
    exercise.value ? store.isExerciseCompleted(exercise.value.id) : false,
  )

  const nextExercise = computed(() => {
    if (!exercise.value) return null
    const all = store.allExercises
    const idx = all.findIndex((e) => e.id === exercise.value!.id)
    return all[idx + 1] ?? null
  })

  // ── Stroke display helpers ──────────────────────────────────────────────────

  function strokeLabel(s: Stroke): string {
    if (s === 'D') return '↓'
    if (s === 'U') return '↑'
    return '·'
  }

  function strokeColor(s: Stroke): string {
    if (s === 'D') return 'var(--color-accent)'
    if (s === 'U') return '#a78bfa'
    return 'var(--color-inactive)'
  }

  const breadcrumb = computed(() => {
    if (!exercise.value) return null
    for (const phase of store.program.phases) {
      for (const week of phase.weeks) {
        for (const day of week.days) {
          if (day.exercises.some((e) => e.id === exercise.value!.id)) {
            return { phase: phase.phaseNumber, week: week.weekNumber, day: day.dayNumber }
          }
        }
      }
    }
    return null
  })

  // ── Actions ─────────────────────────────────────────────────────────────────

  async function startSession() {
    if (!isListening.value) await startMic()
    session.start()
  }

  function handleRetry() {
    session.reset()
  }

  function handleContinue() {
    if (nextExercise.value) {
      router.push({ name: 'exercise', params: { id: nextExercise.value.id } })
    } else {
      router.push({ name: 'home' })
    }
  }
</script>

<template>
  <div
    v-if="exercise"
    class="mx-auto max-w-3xl px-6 py-8 space-y-6"
  >
    <!-- Breadcrumb -->
    <div
      v-if="breadcrumb"
      class="flex items-center gap-2 font-mono text-xs text-[var(--color-inactive)]"
    >
      <button
        class="hover:text-white transition-colors"
        @click="router.back()"
      >
        ← Back
      </button>
      <span>/</span>
      <span>Phase {{ breadcrumb.phase }}</span>
      <span>/</span>
      <span>Week {{ breadcrumb.week }}</span>
      <span>/</span>
      <span>Day {{ breadcrumb.day }}</span>
    </div>

    <!-- Title -->
    <div>
      <h1 class="text-2xl font-bold text-white">
        {{ exercise.title }}
      </h1>
      <p class="mt-1 text-sm text-[var(--color-inactive)]">
        {{ exercise.description }}
      </p>
    </div>

    <!-- Beat lane (shown while running or after completion) -->
    <BeatLane
      v-if="session.isRunning.value || session.isComplete.value"
      :scheduled-bars="session.scheduledBars.value"
      :bar-results="session.barResults.value"
      :is-running="session.isRunning.value"
    />

    <!-- Session summary (after completion) -->
    <SessionSummary
      v-if="session.isComplete.value"
      :bar-results="session.barResults.value"
      :exercise-title="exercise.title"
      :unlock-threshold="exercise.unlockThreshold"
      :did-unlock="didUnlock"
      @retry="handleRetry"
      @continue="handleContinue"
    />

    <!-- Pre-session details (hidden during active session) -->
    <template v-if="!session.isRunning.value && !session.isComplete.value">
      <!-- Stats row -->
      <div class="flex flex-wrap gap-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4">
        <div>
          <p class="mb-0.5 text-xs text-[var(--color-inactive)] uppercase tracking-wide">
            Tempo
          </p>
          <BpmBadge :bpm="exercise.bpm" />
        </div>
        <div>
          <p class="mb-0.5 text-xs text-[var(--color-inactive)] uppercase tracking-wide">
            Time
          </p>
          <span class="font-mono text-sm text-white">
            {{ exercise.timeSignature[0] }}/{{ exercise.timeSignature[1] }}
          </span>
        </div>
        <div>
          <p class="mb-0.5 text-xs text-[var(--color-inactive)] uppercase tracking-wide">
            Bars
          </p>
          <span class="font-mono text-sm text-white">
            {{ exercise.bars }}
          </span>
        </div>
        <div>
          <p class="mb-0.5 text-xs text-[var(--color-inactive)] uppercase tracking-wide">
            Unlock at
          </p>
          <span class="font-mono text-sm text-white">
            {{ Math.round(exercise.unlockThreshold * 100) }}% timing
          </span>
        </div>
      </div>

      <!-- Chord sequence -->
      <div>
        <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-inactive)]">
          Chord Sequence
        </p>
        <div class="flex flex-wrap gap-2">
          <ChordBadge
            v-for="(chord, i) in exercise.chordSequence"
            :key="i"
            :chord="chord"
            size="md"
          />
        </div>
      </div>

      <!-- Strumming pattern -->
      <div>
        <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-inactive)]">
          Strumming Pattern (per bar)
        </p>
        <div class="flex gap-2">
          <span
            v-for="(stroke, i) in exercise.strummingPattern"
            :key="i"
            class="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] font-mono text-xl font-bold"
            :style="{ color: strokeColor(stroke) }"
          >
            {{ strokeLabel(stroke) }}
          </span>
        </div>
      </div>
    </template>

    <!-- Audio + chord display (always visible) -->
    <div
      v-if="!session.isComplete.value"
      class="flex items-start gap-4"
    >
      <div class="flex-1">
        <AudioStatusBar
          :is-listening="isListening"
          :permission-state="permissionState"
          :current-rms="currentRms"
          :last-onset="lastOnset"
          @start="startMic"
          @stop="stopMic"
          @retry="startMic"
        />
        <p
          v-if="isListening"
          class="mt-1.5 text-xs text-[var(--color-inactive)]"
        >
          Chord detection is experimental. Works best with clean, sustained shapes.
        </p>
      </div>
      <ChordDisplay
        v-if="isListening"
        :chord="detectedChord"
        :confidence="confidence"
      />
    </div>

    <!-- Start button (only before session) -->
    <button
      v-if="!session.isRunning.value && !session.isComplete.value"
      class="w-full rounded-xl bg-[var(--color-accent)] py-4 font-semibold text-black transition-opacity hover:opacity-90"
      @click="startSession"
    >
      Start Practice Session
    </button>

    <!-- Progress during session -->
    <div
      v-if="session.isRunning.value"
      class="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3"
    >
      <span class="font-mono text-sm text-[var(--color-inactive)]">
        Bar
        <span class="text-white">{{ session.completedBarCount.value }}</span>
        / {{ exercise.bars }}
      </span>
      <button
        class="text-xs text-[var(--color-miss)] hover:underline"
        @click="session.stop"
      >
        Stop
      </button>
    </div>
  </div>

  <div
    v-else
    class="flex min-h-screen items-center justify-center"
  >
    <p class="text-[var(--color-inactive)]">
      Exercise not found.
    </p>
  </div>

  <MetronomePanel />
</template>
