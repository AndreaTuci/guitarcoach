<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useProgramStore } from '@/stores/program'
  import { useSessionStore } from '@/stores/session'
  import ProgressRing from '@/components/atoms/ProgressRing.vue'
  import ExerciseCard from '@/components/molecules/ExerciseCard.vue'

  const program = useProgramStore()
  const sessions = useSessionStore()
  const router = useRouter()

  const recentSessions = computed(() => sessions.history.slice(0, 8))

  function exerciseTitleById(id: string): string {
    return program.getExerciseById(id)?.title ?? id
  }

  function formatDate(ts: number): string {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(ts),
    )
  }

  function accuracyColor(pct: number): string {
    if (pct >= 0.85) return 'var(--color-perfect)'
    if (pct >= 0.6) return 'var(--color-good)'
    return 'var(--color-miss)'
  }

  function goToNext() {
    const next = program.nextUnlockedExercise
    if (next) router.push({ name: 'exercise', params: { id: next.id } })
  }
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10 space-y-10">
    <!-- Progress header -->
    <section class="flex items-center gap-6">
      <div class="relative flex items-center justify-center">
        <ProgressRing :percent="program.completionPercent" :size="88" :stroke-width="6" />
        <span class="absolute font-mono text-lg font-bold text-white">
          {{ program.completionPercent }}%
        </span>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-white">Welcome back</h1>
        <p class="text-[var(--color-inactive)] text-sm">
          {{ program.completedExerciseIds.size }} of {{ program.allExercises.length }} exercises completed
        </p>
      </div>
    </section>

    <!-- Next exercise -->
    <section v-if="program.nextUnlockedExercise">
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-inactive)]">
        Up Next
      </h2>
      <ExerciseCard
        :exercise="program.nextUnlockedExercise"
        :is-unlocked="true"
        :is-completed="false"
      />
    </section>
    <section v-else>
      <p class="text-[var(--color-perfect)] font-semibold">Program complete!</p>
    </section>

    <!-- Session history -->
    <section v-if="recentSessions.length > 0">
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-inactive)]">
        Recent Sessions
      </h2>
      <div class="space-y-2">
        <div
          v-for="session in recentSessions"
          :key="session.id"
          class="flex items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
        >
          <div class="flex-1 min-w-0">
            <p class="truncate text-sm text-white">{{ exerciseTitleById(session.exerciseId) }}</p>
            <p class="text-xs text-[var(--color-inactive)]">{{ formatDate(session.startedAt) }}</p>
          </div>
          <div class="flex gap-4 font-mono text-xs">
            <span :style="{ color: accuracyColor(session.tempoAccuracyPct) }">
              ♩ {{ Math.round(session.tempoAccuracyPct * 100) }}%
            </span>
            <span :style="{ color: accuracyColor(session.chordAccuracyPct) }">
              ♫ {{ Math.round(session.chordAccuracyPct * 100) }}%
            </span>
          </div>
        </div>
      </div>
    </section>
    <section v-else>
      <p class="text-sm text-[var(--color-inactive)]">
        No sessions yet. Open an exercise and start playing.
      </p>
    </section>
  </div>
</template>
