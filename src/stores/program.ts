import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Program, Exercise, Phase, Week, Song } from '@/types/program'
import { PROGRAM } from '@/data/program'
import { SONGS } from '@/data/songs'

export const useProgramStore = defineStore('program', () => {
  const program = ref<Program>(PROGRAM)
  const songs = ref<Song[]>(SONGS)

  // Set of completed exercise IDs, persisted to localStorage
  const completedExerciseIds = ref<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('completedExercises') ?? '[]') as string[]),
  )

  const allExercises = computed<Exercise[]>(() =>
    program.value.phases.flatMap((phase: Phase) =>
      phase.weeks.flatMap((week: Week) => week.days.flatMap((day) => day.exercises)),
  ))

  function isExerciseCompleted(exerciseId: string): boolean {
    return completedExerciseIds.value.has(exerciseId)
  }

  function isExerciseUnlocked(exerciseId: string): boolean {
    const exercises = allExercises.value
    const idx = exercises.findIndex((e) => e.id === exerciseId)
    if (idx === 0) return true
    // An exercise is unlocked if the previous one is completed
    return completedExerciseIds.value.has(exercises[idx - 1]?.id ?? '')
  }

  function markExerciseCompleted(exerciseId: string): void {
    completedExerciseIds.value.add(exerciseId)
    localStorage.setItem('completedExercises', JSON.stringify([...completedExerciseIds.value]))
  }

  function getExerciseById(id: string): Exercise | undefined {
    return allExercises.value.find((e) => e.id === id)
  }

  function isSongUnlocked(song: Song): boolean {
    return completedExerciseIds.value.has(song.unlockAfterExerciseId)
  }

  const nextUnlockedExercise = computed<Exercise | undefined>(() =>
    allExercises.value.find((e) => !completedExerciseIds.value.has(e.id)),
  )

  const completionPercent = computed<number>(() => {
    const total = allExercises.value.length
    if (total === 0) return 0
    return Math.round((completedExerciseIds.value.size / total) * 100)
  })

  return {
    program,
    songs,
    allExercises,
    completedExerciseIds,
    completionPercent,
    nextUnlockedExercise,
    isExerciseCompleted,
    isExerciseUnlocked,
    markExerciseCompleted,
    getExerciseById,
    isSongUnlocked,
  }
})
