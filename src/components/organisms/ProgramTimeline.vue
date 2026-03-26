<script setup lang="ts">
  import { computed } from 'vue'
  import { useProgramStore } from '@/stores/program'
  import PhaseHeader from '@/components/molecules/PhaseHeader.vue'
  import ExerciseCard from '@/components/molecules/ExerciseCard.vue'
  import type { Phase, Week } from '@/types/program'

  const store = useProgramStore()

  function phaseExercises(phase: Phase) {
    return phase.weeks.flatMap((w: Week) => w.days.flatMap((d) => d.exercises))
  }

  function phaseCompletedCount(phase: Phase) {
    return phaseExercises(phase).filter((e) => store.isExerciseCompleted(e.id)).length
  }

  const phases = computed(() => store.program.phases)
</script>

<template>
  <div class="space-y-12">
    <section v-for="phase in phases" :key="phase.id">
      <PhaseHeader
        :phase="phase"
        :completed-count="phaseCompletedCount(phase)"
        :total-count="phaseExercises(phase).length"
      />

      <div v-for="week in phase.weeks" :key="week.id" class="mb-8">
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-inactive)]">
          Week {{ week.weekNumber }} — {{ week.title }}
        </h3>

        <div class="space-y-4">
          <div v-for="day in week.days" :key="day.id">
            <p class="mb-2 text-xs text-[var(--color-inactive)]">Day {{ day.dayNumber }}</p>
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ExerciseCard
                v-for="exercise in day.exercises"
                :key="exercise.id"
                :exercise="exercise"
                :is-unlocked="store.isExerciseUnlocked(exercise.id)"
                :is-completed="store.isExerciseCompleted(exercise.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
