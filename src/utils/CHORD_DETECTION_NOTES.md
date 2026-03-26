# Chord Detection — Architecture & Calibration Notes

Last updated: 2026-03-26
Mic used during testing: built-in laptop mic (noisy environment, no headphones)

---

## Architecture (current — v2)

### Pipeline

```
AnalyserNode (fftSize=4096, minDecibels=−100, maxDecibels=0)
    │
    │  getFloatFrequencyData() every 33 ms (~30 fps)
    ↓
guitarSpectralContrast()
    ├── peakDb in 80–600 Hz range
    └── contrast = peak − median in 80–600 Hz range

    ┌── GATE 1: peakDb < −52 dB  → skip frame (too quiet)
    ├── GATE 2: contrast < 12 dB → skip frame (spectrally flat — noise or metronome sine)
    │
    ↓ (frame passed gates)
buildChromagram()
    ├── dB → linear amplitude (referenced to −80 dB noise floor)
    ├── Map each bin to pitch class (0=C … 11=B)
    └── L² normalize

    → 12-bin chroma vector pushed into ring buffer (up to 30 frames)

    every 200 ms:
    average chroma buffer → matchChord() → cosine similarity vs templates

    ┌── GATE 3: confidence < 0.50  → null
    ├── GATE 4: temporal stability — same chord must appear in 2 consecutive
    │           200 ms windows before being reported (kills transients)
    │
    ↓ (chord confirmed)
detectSoundingStrings()
    └── For each sounding string in the chord voicing, check energy in a
        ±18 Hz window around its expected fundamental.
        Returns 'sounding' | 'deaf' | 'muted' per string.

Output: detectedChord, confidence, stringStates[6]
```

### Why float frequency data (v2 key change)

The old `getByteFrequencyData()` used default `minDecibels=−100, maxDecibels=−30`. With these
defaults, byte value 18 corresponds to approximately −95 dB — essentially silence. The gate
was therefore near-useless.

`getFloatFrequencyData()` returns actual dB values. The new gate requires `peakDb > −52 dB`
which corresponds to a clearly audible signal, well above room noise.

### Why spectral contrast (v2 key change)

Root cause of the A-during-silence bug:
- The metronome click sound is a 900 Hz sine wave (A5).
- 900 Hz maps to pitch class A.
- Cosine similarity of a pure A pitch class against the A chord template ≈ 0.74 — above the
  confidence threshold.
- The old energy gate did not distinguish between a tonal sine and a guitar chord.

Spectral contrast fix: a 900 Hz sine wave in the 80–600 Hz band produces one small peak
(perhaps none at all, since 900 Hz is outside that range). A guitar chord has multiple harmonic
peaks in that band, giving high contrast. The contrast gate blocks the sine.

Background room noise is spectrally flat (low contrast) and is blocked even if the absolute
level is high (e.g., a loud A/C unit).

### Why temporal stability (v2 key change)

A metronome click lasts ~50 ms. Even if it slipped through the spectral gate, it cannot produce
the same chord in two consecutive 200 ms detection windows, so `STABILITY_COUNT = 2` eliminates
it entirely. This also smooths genuine chord transitions — a new chord is only reported after it
has been detected twice (400 ms delay on chord change, which is imperceptible in practice).

### Per-string detection

For each chord in the curriculum the exact fundamental frequency of every sounding string is
known from the chord voicing (see `chordNotes.ts`). After the chord is confirmed, each string's
fundamental bin is checked in a ±18 Hz window. If the peak dB in that window is below −60 dB,
the string is classified as **deaf** — it should ring but doesn't.

This enables Yousician-style feedback: "G string not ringing — press harder on fret 1."

String states are exposed as `StringState[] = ('sounding' | 'deaf' | 'muted')[]` and displayed
as 6 coloured dots in `ChordDisplay.vue`.

---

## Per-chord status (v2)

| Chord | Status | Notes |
|-------|--------|-------|
| **Em** | ✅ Good | G(7)=2.0 distinguishes from E. All 6 strings have clear, well-separated fundamentals. |
| **Am** | ✅ Good | A(9)=2.0. 5 strings; E6 muted. C(0) is the distinguishing note from Am vs Em. |
| **G**  | ✅ Good | G(7)=2.0 + B(11)=1.5. G2 at 98 Hz now better resolved with fftSize=4096 (was 2 bins at 2048). |
| **C**  | ⚠️ Unreliable | E(4) and C(0) both 1.5. E is the loudest note in open C voicing. Confused with Am on poor mics because C root (130 Hz on A string) is often weak. Deaf string check helps: if A string (130 Hz, C3) is deaf → likely Am not C. |
| **D**  | ⚠️ Sometimes missed | F#(6)=2.0 (B string 2nd fret, 370 Hz). Now better resolved at 4096. Still needs the F# to ring clearly. |
| **A**  | ✅ Improved | Was the main false-positive culprit. Fixed by spectral contrast gate (metronome at 900 Hz = A5 no longer triggers it) and temporal stability. C#(1)=1.5 is the distinguishing note from Em. |
| **E**  | ✅ Good | B(11)=2.0 clearly separates from Em (Em has G minor-third instead). |
| **Dm** | ⚠️ Confused with F | D(2)=2.5 to anchor Dm. If D string (open, 147 Hz) is deaf, D root disappears and Dm looks like F. String status will flag this. |
| **F**  | ⚠️ Hard | Barre chord. Requires all 6 strings pressed simultaneously. F(5)=2.5. String status dots are the most useful feedback here — typically one or two strings are deaf on an imperfect barre. |

---

## String frequency reference (standard EADGBE)

All values in Hz. Source: `chordNotes.ts`.

| Chord | E2(6th) | A2(5th) | D3(4th) | G3(3rd) | B3(2nd) | E4(1st) |
|-------|---------|---------|---------|---------|---------|---------|
| Em    | 82.4    | 123.5   | 164.8   | 196.0   | 246.9   | 329.6   |
| Am    | muted   | 110.0   | 164.8   | 220.0   | 261.6   | 329.6   |
| G     | 98.0    | 123.5   | 146.8   | 196.0   | 246.9   | 392.0   |
| C     | muted   | 130.8   | 164.8   | 196.0   | 261.6   | 329.6   |
| D     | muted   | muted   | 146.8   | 220.0   | 293.7   | 370.0   |
| A     | muted   | 110.0   | 164.8   | 220.0   | 277.2   | 329.6   |
| E     | 82.4    | 123.5   | 164.8   | 207.7   | 246.9   | 329.6   |
| Dm    | muted   | muted   | 146.8   | 220.0   | 293.7   | 349.2   |
| F     | 87.3    | 130.8   | 174.6   | 220.0   | 261.6   | 349.2   |

---

## Tuning knobs

| Parameter | File | Current value | Effect |
|-----------|------|---------------|--------|
| `MIN_PEAK_DB` | `useChordDetector.ts` | −52 dB | Absolute signal floor. Raise if noise still passes; lower if guitar is not being detected at all. |
| `MIN_CONTRAST_DB` | `useChordDetector.ts` | 12 dB | Spectral contrast floor. Raise to block more noise; lower if soft chords are missed. |
| `MIN_CONFIDENCE` | `useChordDetector.ts` | 0.50 | Cosine similarity floor for accepting a chord match. |
| `STABILITY_COUNT` | `useChordDetector.ts` | 2 | Consecutive windows required. Raise to 3 for more stability at the cost of ~200 ms extra latency. |
| `MIN_MARGIN` | `chordMatcher.ts` | 0.05 | Best match must beat second-best by this margin. Raise if ambiguous chords leak through. |
| `DEAF_THRESHOLD_DB` | `chordNotes.ts` | −60 dB | String energy floor for per-string detection. Lower if strings are being flagged as deaf even when ringing. |
| `fftSize` | `useAudioInput.ts` | 4096 | Bin width: 44100/4096 ≈ 10.8 Hz. Do not lower below 4096 — E2 and A2 are only 28 Hz apart and need at least 2–3 bin separation. |

---

## Known remaining issues

- **C vs Am** — Both share C, E, G. The distinguishing feature is the A root in Am vs C root in C. The per-string check (is the A5 string at 110 Hz sounding?) may help: Am plays A string open; C mutes E6 and frets A string at 130 Hz. These are different frequencies and now distinguishable with fftSize=4096.
- **D and F#** — F# at 370 Hz is the key D chord note. Now 2–3 bins wide at 4096. If the B string isn't pressed cleanly it won't appear, causing D to be missed.
- **F barre chord** — Fundamentally hard. A clean barre press is required. The per-string dots showing which strings are deaf are the most useful feedback.
- **Metronome picked up by mic** — Fixed by spectral contrast + temporal stability. But if the user is playing very quietly and the metronome is at full volume through speakers, the metronome may still pollute the chromagram in the buffer. Using headphones eliminates this entirely.
- **Harmonic overlap** — The 3rd harmonic of E2 (82×3=246 Hz) falls on B3. The 2nd harmonic of A2 (110×2=220 Hz) falls on A3. These overlaps are reduced by the temporal averaging and by using float data with a proper noise floor, but a full harmonic product spectrum (HPS) approach would eliminate them. Deferred — current accuracy is sufficient for the rhythm/strumming use case.
