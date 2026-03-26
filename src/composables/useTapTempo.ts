/**
 * Calculates BPM from tap intervals.
 * Keeps the last 5 tap timestamps and averages the intervals.
 * Resets if the gap between taps exceeds 3 seconds.
 */

const MAX_TAPS = 5
const RESET_THRESHOLD_MS = 3000

export function useTapTempo() {
  const taps: number[] = []

  /** Call on each tap. Returns calculated BPM, or null if fewer than 2 taps recorded. */
  function tap(): number | null {
    const now = Date.now()

    if (taps.length > 0 && now - taps[taps.length - 1] > RESET_THRESHOLD_MS) {
      taps.length = 0
    }

    taps.push(now)
    if (taps.length > MAX_TAPS + 1) taps.shift()
    if (taps.length < 2) return null

    let total = 0
    for (let i = 1; i < taps.length; i++) {
      total += taps[i] - taps[i - 1]
    }
    const avgMs = total / (taps.length - 1)
    return Math.max(40, Math.min(220, Math.round(60000 / avgMs)))
  }

  function reset(): void {
    taps.length = 0
  }

  return { tap, reset }
}
