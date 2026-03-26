/**
 * Singleton AudioContext manager.
 * AudioContext must be created on a user gesture — never on import.
 * All composables that need audio share this single instance.
 */

let ctx: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (!ctx || ctx.state === 'closed') {
    ctx = new AudioContext()
  }
  if (ctx.state === 'suspended') {
    // Resume if browser auto-suspended it
    void ctx.resume()
  }
  return ctx
}

export function closeAudioContext(): void {
  if (ctx) {
    void ctx.close()
    ctx = null
  }
}
