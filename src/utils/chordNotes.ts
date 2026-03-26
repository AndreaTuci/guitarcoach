import type { Chord } from '@/types/program'

/**
 * Per-chord expected fundamental frequencies for each of the 6 guitar strings.
 *
 * Index 0 = thickest string (E2, 82.41 Hz), index 5 = thinnest (E4, 329.63 Hz).
 * null = string is intentionally muted for this chord voicing.
 *
 * Standard EADGBE tuning. Fretted notes: openFreq × 2^(fret/12).
 *
 * Open string fundamentals:
 *   E2 = 82.41 Hz  A2 = 110.00 Hz  D3 = 146.83 Hz
 *   G3 = 196.00 Hz  B3 = 246.94 Hz  E4 = 329.63 Hz
 */
export const CHORD_STRING_FREQS: Record<Chord, (number | null)[]> = {
  //       E2(6th) A2(5th) D3(4th) G3(3rd) B3(2nd) E4(1st)
  Em: [    82.4,   123.5,  164.8,  196.0,  246.9,  329.6  ],  // 0-2-2-0-0-0
  Am: [    null,   110.0,  164.8,  220.0,  261.6,  329.6  ],  // x-0-2-2-1-0
  G:  [    98.0,   123.5,  146.8,  196.0,  246.9,  392.0  ],  // 3-2-0-0-0-3
  C:  [    null,   130.8,  164.8,  196.0,  261.6,  329.6  ],  // x-3-2-0-1-0
  D:  [    null,   null,   146.8,  220.0,  293.7,  370.0  ],  // x-x-0-2-3-2
  A:  [    null,   110.0,  164.8,  220.0,  277.2,  329.6  ],  // x-0-2-2-2-0
  E:  [    82.4,   123.5,  164.8,  207.7,  246.9,  329.6  ],  // 0-2-2-1-0-0
  Dm: [    null,   null,   146.8,  220.0,  293.7,  349.2  ],  // x-x-0-2-3-1
  F:  [    87.3,   130.8,  174.6,  220.0,  261.6,  349.2  ],  // 1-3-3-2-1-1
}

/** Human-readable label for each string (index 0 = thickest). */
export const STRING_NAMES = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] as const

/**
 * For a matched chord, determine whether each string is sounding or not.
 *
 * Looks for energy within ±WINDOW_HZ of each string's expected fundamental.
 * Returns a boolean[] where true = energy detected (string is vibrating).
 *
 * Strings that are muted in the chord template (null) always return false.
 */
export function detectSoundingStrings(
  chord: Chord,
  floatFreqData: Float32Array,
  sampleRate: number,
  fftSize: number,
): boolean[] {
  const freqs = CHORD_STRING_FREQS[chord]
  const DEAF_THRESHOLD_DB = -60  // Below this dB → string not sounding
  const WINDOW_HZ = 18           // Search ±18 Hz around expected fundamental

  const binWidth = sampleRate / fftSize
  const windowBins = Math.max(2, Math.round(WINDOW_HZ / binWidth))

  return freqs.map((expectedFreq) => {
    if (expectedFreq === null) return false

    const centerBin = Math.round(expectedFreq / binWidth)
    let maxDb = -100
    for (
      let b = Math.max(1, centerBin - windowBins);
      b <= Math.min(floatFreqData.length - 1, centerBin + windowBins);
      b++
    ) {
      if (floatFreqData[b]! > maxDb) maxDb = floatFreqData[b]!
    }
    return maxDb > DEAF_THRESHOLD_DB
  })
}
