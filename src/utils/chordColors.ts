import type { Chord } from '@/types/program'

/**
 * Consistent color per chord across the entire app.
 * These match the CSS variables defined in main.css — but are also available
 * as plain hex for canvas rendering (which cannot read CSS variables).
 */
export const CHORD_COLORS: Record<Chord, string> = {
  Em: '#6366f1', // indigo
  Am: '#ec4899', // pink
  G: '#22c55e', // green
  C: '#f59e0b', // amber
  D: '#3b82f6', // blue
  A: '#a855f7', // purple
  E: '#14b8a6', // teal
  Dm: '#f97316', // orange
  F: '#e11d48', // rose
}
