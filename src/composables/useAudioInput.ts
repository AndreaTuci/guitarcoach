import { ref, onUnmounted } from 'vue'
import { getAudioContext } from '@/services/audioEngine'
import { logger } from '@/utils/logger'

export type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'

/**
 * Manages microphone access and the AnalyserNode.
 * The AnalyserNode is passed to useOnsetDetector and useChordDetector.
 *
 * Rules:
 * - Never request mic on import — only on explicit start() call
 * - Uses the shared AudioContext from audioEngine (does NOT close it on stop)
 */
export function useAudioInput() {
  const isListening = ref(false)
  const permissionState = ref<PermissionState>('idle')
  const analyserNode = ref<AnalyserNode | null>(null)

  let stream: MediaStream | null = null
  let sourceNode: MediaStreamAudioSourceNode | null = null

  async function start(): Promise<void> {
    if (isListening.value) return

    if (!navigator.mediaDevices?.getUserMedia) {
      permissionState.value = 'unsupported'
      return
    }

    permissionState.value = 'requesting'

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
    } catch (err) {
      logger.warn('Mic access denied', err)
      permissionState.value = 'denied'
      return
    }

    const ctx = getAudioContext()
    sourceNode = ctx.createMediaStreamSource(stream)

    const analyser = ctx.createAnalyser()
    analyser.fftSize = 4096            // Higher resolution: ~10.8 Hz/bin vs 21.5 Hz/bin
    analyser.smoothingTimeConstant = 0 // No smoothing — chord detector averages its own window
    analyser.minDecibels = -100        // Full dB range for getFloatFrequencyData()
    analyser.maxDecibels = 0
    sourceNode.connect(analyser)

    analyserNode.value = analyser
    isListening.value = true
    permissionState.value = 'granted'
    logger.info('Mic started')
  }

  function stop(): void {
    if (!isListening.value) return

    sourceNode?.disconnect()
    sourceNode = null

    stream?.getTracks().forEach((t) => t.stop())
    stream = null

    analyserNode.value = null
    isListening.value = false
    logger.info('Mic stopped')
  }

  onUnmounted(() => stop())

  return { isListening, permissionState, analyserNode, start, stop }
}
