# Chord Detection — Calibration Notes

Last updated: 2026-03-26
Mic used during testing: built-in laptop mic (poor quality, noisy environment)

---

## How it works

1. `AnalyserNode.getByteFrequencyData()` → FFT frame (Uint8Array, 1024 bins)
2. Energy gate: skip frame if mean energy in 65–2000 Hz range < `MIN_ENERGY` (currently 18)
3. `buildChromagram()` → 12-bin pitch class profile, L∞ normalised
4. Frames aggregated into a 500ms ring buffer
5. Buffer averaged → `matchChord()` → cosine similarity vs chord templates
6. Margin check: best must beat second-best by ≥ 0.05, else reported as ambiguous
7. Confidence < 0.5 → shown as "?" in UI

---

## Per-chord status

| Chord | Status | Notes |
|-------|--------|-------|
| **Em** | ✅ Working | G(7)=2.0 is the key weight — distinguishes from E major |
| **Am** | ✅ Working | A(9) root dominates clearly |
| **G**  | ✅ Working | G(7)=2.0 + B(11)=1.5 give a clean profile |
| **C**  | ⚠️ Unreliable | E(4) is the loudest note in the open C voicing (3 strings), so E and C are both set to 1.5. On poor mics the C root often doesn't come through strongly — easily confused with Am. May need per-device calibration. |
| **D**  | ⚠️ Sometimes missed | F#(6) raised to 2.0 (B string 2nd fret). On a noisy mic the F# bin is weak and the chord can be swallowed by the energy gate. Try sustaining the chord longer. |
| **A**  | ⚠️ False positives | Was detecting A on silence/noise. Fixed by raising energy gate to 18 and the margin check. Still the most fragile template — C#(1) is the distinguishing note from Am but it's a quiet overtone. |
| **E**  | ✅ Working | B(11)=2.0 separates it from Em (which has G instead of G#/B). |
| **Dm** | ⚠️ Confused with F | Dm and F share F(5) and A(9). Fix: D(2)=2.5 in Dm, F(5)=0.5. If the open D string doesn't ring clearly (muted or weak mic), the remaining F+A looks like F major. Needs clean playing. |
| **F**  | ⚠️ Hard to detect | Barre chord — requires full barre press. F(5)=2.5. On poor mics the barre mutes some strings and the chromagram is weak. Energy gate may drop its frames. Try pressing harder and sustaining. |

---

## Known issues to revisit

- **C vs Am** — both have C and E. Distinguishing feature is G(7) in C vs A(9) in Am. If the G string doesn't ring cleanly in C, the detector leans toward Am. Could try looking at absence of A(9) as a negative signal.
- **D and F missed on noisy mic** — `MIN_ENERGY = 18` may be too high for some setups. Consider making this configurable or auto-calibrating from the noise floor on mic start.
- **Margin check may be too aggressive** — some chords that should detect cleanly get killed by the 0.05 margin. Consider lowering to 0.03 if too many "?" results.
- **F# in D chord** — the F# fundamental at ~370 Hz should be clear but chromagram bin resolution at that frequency is ~21 Hz/bin, so neighbouring bins bleed. Could try weighting F# and its octave (F#5) together.
- **General** — a harmonic weighting approach (weighting each bin by harmonic series of its fundamental) would improve all chords. Deferred — current approach is good enough for the rhythm/timing use case where chord detection is a secondary signal.

---

## Tuning knobs

| Parameter | Location | Current value | Effect |
|-----------|----------|---------------|--------|
| `MIN_ENERGY` | `useChordDetector.ts` | 18 | Raise to reduce noise false positives; lower if weak mic misses all chords |
| `MIN_CONFIDENCE` | `useChordDetector.ts` | 0.5 | Raise for fewer but more accurate results |
| `MIN_MARGIN` | `chordMatcher.ts` | 0.05 | Raise if ambiguous chords slip through; lower if too many "?" |
| `WINDOW_MS` | `useChordDetector.ts` | 500ms | Raise for more stable detection on sustained chords; lower for faster response |
