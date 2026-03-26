import { defineStore } from 'pinia'
import { useMetronome } from '@/composables/useMetronome'

/**
 * Pinia singleton for the metronome.
 * Both MetronomePanel and useExerciseSession share this instance
 * so the session can read BPM and react to the metronome state.
 */
export const useMetronomeStore = defineStore('metronome', useMetronome)
