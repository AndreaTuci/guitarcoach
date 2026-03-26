/** Fired when a strum onset is detected from the RMS envelope follower */
export interface OnsetEvent {
  /** AudioContext.currentTime at the moment of onset */
  timestamp: number
  /** RMS amplitude at onset (0–1) */
  rms: number
}
