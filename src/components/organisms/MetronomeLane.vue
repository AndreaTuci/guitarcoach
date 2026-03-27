<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { getAudioContext } from '@/services/audioEngine'

  const props = defineProps<{
    isRunning: boolean
    bpm: number
    beatsPerBar: number
    startAudioTime: number
  }>()

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let ctx2d: CanvasRenderingContext2D | null = null
  let rafId: number | null = null

  const PIXELS_PER_BEAT = 60
  const HIT_ZONE_X_RATIO = 0.22
  const BLOCK_Y = 10
  const BLOCK_H = 95
  const BLOCK_GAP = 4
  const CANVAS_H = 160
  const BALL_R = 6
  const BALL_FLOOR_Y = BLOCK_Y + BLOCK_H - BALL_R - 4
  const BALL_CEIL_Y = BLOCK_Y + BALL_R + 4

  function resize() {
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = CANVAS_H
  }

  function drawGuitarNeck(W: number) {
    if (!ctx2d) return
    for (let i = 0; i < 6; i++) {
      const y = 6 + (i / 5) * (CANVAS_H - 12)
      const alpha = 0.10 + (i / 5) * 0.15
      const lineW = 0.6 + (5 - i) * 0.25
      ctx2d.strokeStyle = `rgba(190, 150, 70, ${alpha})`
      ctx2d.lineWidth = lineW
      ctx2d.beginPath()
      ctx2d.moveTo(0, y)
      ctx2d.lineTo(W, y)
      ctx2d.stroke()
    }
  }

  function parabolaY(t: number): number {
    return BALL_FLOOR_Y - (BALL_FLOOR_Y - BALL_CEIL_Y) * 4 * t * (1 - t)
  }

  function drawFrame() {
    const canvas = canvasRef.value
    if (!canvas || !ctx2d) return

    const W = canvas.width
    const hitX = W * HIT_ZONE_X_RATIO
    const beatDuration = 60 / props.bpm
    const barDuration = props.beatsPerBar * beatDuration
    const scrollSpeed = PIXELS_PER_BEAT * (props.bpm / 60)

    ctx2d.fillStyle = '#0d0d0d'
    ctx2d.fillRect(0, 0, W, CANVAS_H)

    drawGuitarNeck(W)

    if (props.isRunning && props.startAudioTime > 0) {
      const now = getAudioContext().currentTime
      const elapsed = now - props.startAudioTime

      // Scrolling bar blocks
      const firstBarN = Math.max(0, Math.floor((elapsed - hitX / scrollSpeed) / barDuration) - 1)
      const lastBarN = Math.ceil((elapsed + (W - hitX) / scrollSpeed) / barDuration) + 1

      for (let n = firstBarN; n <= lastBarN; n++) {
        const barStart = props.startAudioTime + n * barDuration
        const x = hitX + (barStart - now) * scrollSpeed
        const blockW = barDuration * scrollSpeed

        if (x + blockW < 0 || x > W) continue

        ctx2d.save()
        ctx2d.globalAlpha = n % 2 === 0 ? 0.13 : 0.06
        ctx2d.fillStyle = '#00d4aa'
        ctx2d.beginPath()
        ctx2d.roundRect(x, BLOCK_Y, blockW - BLOCK_GAP, BLOCK_H, 8)
        ctx2d.fill()
        ctx2d.restore()

        // Beat subdivision ticks
        for (let b = 1; b < props.beatsPerBar; b++) {
          const tickX = x + b * beatDuration * scrollSpeed
          if (tickX < 0 || tickX > W) continue
          ctx2d.save()
          ctx2d.strokeStyle = 'rgba(0, 212, 170, 0.22)'
          ctx2d.lineWidth = 1
          ctx2d.setLineDash([2, 3])
          ctx2d.beginPath()
          ctx2d.moveTo(tickX, BLOCK_Y + 10)
          ctx2d.lineTo(tickX, BLOCK_Y + BLOCK_H - 10)
          ctx2d.stroke()
          ctx2d.setLineDash([])
          ctx2d.restore()
        }
      }

      // Dotted future trajectory
      const LOOKAHEAD_PX = Math.min(W - hitX - 8, 320)
      const DOT_STEP = 4
      ctx2d.save()
      ctx2d.fillStyle = 'rgba(255,255,255,0.28)'
      for (let dx = DOT_STEP; dx < LOOKAHEAD_PX; dx += DOT_STEP) {
        const futurePhase = ((elapsed + dx / scrollSpeed) % beatDuration) / beatDuration
        const dotY = parabolaY(futurePhase)
        ctx2d.beginPath()
        ctx2d.arc(hitX + dx, dotY, 1.8, 0, Math.PI * 2)
        ctx2d.fill()
      }
      ctx2d.restore()

      // Bouncing ball
      const beatPhase = (elapsed % beatDuration) / beatDuration
      const ballY = parabolaY(Math.max(0, Math.min(1, beatPhase)))
      ctx2d.save()
      ctx2d.shadowColor = 'rgba(255,255,255,0.55)'
      ctx2d.shadowBlur = 10
      ctx2d.fillStyle = '#ffffff'
      ctx2d.beginPath()
      ctx2d.arc(hitX, ballY, BALL_R, 0, Math.PI * 2)
      ctx2d.fill()
      ctx2d.restore()
    }

    // Hit zone dashed line
    ctx2d.strokeStyle = '#00d4aa'
    ctx2d.lineWidth = 2
    ctx2d.setLineDash([4, 3])
    ctx2d.beginPath()
    ctx2d.moveTo(hitX, 0)
    ctx2d.lineTo(hitX, CANVAS_H)
    ctx2d.stroke()
    ctx2d.setLineDash([])

    // Hit zone triangle marker at top
    ctx2d.fillStyle = '#00d4aa'
    ctx2d.beginPath()
    ctx2d.moveTo(hitX - 6, 0)
    ctx2d.lineTo(hitX + 6, 0)
    ctx2d.lineTo(hitX, 10)
    ctx2d.closePath()
    ctx2d.fill()

    rafId = requestAnimationFrame(drawFrame)
  }

  function startLoop() {
    if (rafId !== null) return
    rafId = requestAnimationFrame(drawFrame)
  }

  function stopLoop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
  }

  watch(() => props.isRunning, (running) => {
    if (running) startLoop()
  })

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return
    ctx2d = canvas.getContext('2d')
    resize()
    window.addEventListener('resize', resize)
    startLoop()
  })

  onUnmounted(() => {
    stopLoop()
    window.removeEventListener('resize', resize)
  })
</script>

<template>
  <div
    class="w-full overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-background)]"
    role="img"
    aria-label="Metronome lane"
  >
    <canvas ref="canvasRef" class="block w-full" :height="160" />
  </div>
</template>
