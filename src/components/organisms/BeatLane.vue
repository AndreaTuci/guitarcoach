<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { getAudioContext } from '@/services/audioEngine'
  import { CHORD_COLORS } from '@/utils/chordColors'
  import type { ScheduledBar } from '@/composables/useExerciseSession'
  import type { BeatResult } from '@/types/program'

  const props = defineProps<{
    scheduledBars: ScheduledBar[]
    barResults: Map<number, BeatResult>
    isRunning: boolean
    sessionBpm: number
  }>()

  // ─── Canvas setup ────────────────────────────────────────────────────────────

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let ctx2d: CanvasRenderingContext2D | null = null
  let rafId: number | null = null

  /**
   * Pixels per quarter-note beat — fixed regardless of BPM.
   * Block width = PPB × beatsPerBar (constant).
   * Scroll speed = PPB × BPM/60 (varies with tempo).
   */
  const PIXELS_PER_BEAT = 60
  const HIT_ZONE_X_RATIO = 0.22
  const BLOCK_Y = 10
  const BLOCK_H = 95
  const BLOCK_GAP = 4
  const CANVAS_H = 160

  // Ball constants
  const BALL_R = 6
  const BALL_FLOOR_Y = BLOCK_Y + BLOCK_H - BALL_R - 4   // 95 — lands near bottom of block
  const BALL_CEIL_Y = BLOCK_Y + BALL_R + 4               // 20 — peaks near top of block

  const STATUS_COLORS = {
    perfect: '#22c55e',
    good: '#f59e0b',
    miss: '#ef4444',
  }

  // ─── Resize ──────────────────────────────────────────────────────────────────

  function resize() {
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = CANVAS_H
  }

  // ─── Guitar neck ─────────────────────────────────────────────────────────────

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

  // ─── Chord block ─────────────────────────────────────────────────────────────

  function drawBlock(
    x: number,
    blockW: number,
    color: string,
    chord: string,
    pattern: string[],
    dimmed: boolean,
    W: number,
  ) {
    if (!ctx2d || blockW <= 0) return

    ctx2d.save()
    ctx2d.globalAlpha = dimmed ? 0.55 : 0.92

    ctx2d.fillStyle = color
    ctx2d.beginPath()
    ctx2d.roundRect(x, BLOCK_Y, blockW - BLOCK_GAP, BLOCK_H, 8)
    ctx2d.fill()

    const visibleX = Math.max(x, 0)
    const visibleRight = Math.min(x + blockW - BLOCK_GAP, W)
    if (visibleRight - visibleX < 20) {
      ctx2d.restore()
      return
    }

    const labelCenterX = Math.max(x + (blockW - BLOCK_GAP) / 2, visibleX + 20)
    const clampedLabelX = Math.min(labelCenterX, visibleRight - 20)

    ctx2d.fillStyle = 'rgba(255,255,255,0.95)'
    ctx2d.font = 'bold 24px JetBrains Mono, monospace'
    ctx2d.textAlign = 'center'
    ctx2d.textBaseline = 'middle'
    ctx2d.fillText(chord, clampedLabelX, BLOCK_Y + BLOCK_H * 0.38)

    if (blockW - BLOCK_GAP > 40) {
      const spacing = Math.min(18, (blockW - BLOCK_GAP - 16) / pattern.length)
      const arrowsW = spacing * pattern.length
      const arrowStartX = x + (blockW - BLOCK_GAP) / 2 - arrowsW / 2 + spacing / 2
      const arrowY = BLOCK_Y + BLOCK_H * 0.72
      const fontSize = Math.max(9, Math.min(13, spacing - 2))

      ctx2d.font = `${fontSize}px JetBrains Mono, monospace`

      for (let i = 0; i < pattern.length; i++) {
        const ax = arrowStartX + i * spacing
        if (ax < visibleX || ax > visibleRight) continue
        const stroke = pattern[i]
        ctx2d.fillStyle =
          stroke === 'D'
            ? 'rgba(255,255,255,0.9)'
            : stroke === 'U'
              ? 'rgba(167,139,250,0.9)'
              : 'rgba(255,255,255,0.25)'
        ctx2d.fillText(
          stroke === 'D' ? '↓' : stroke === 'U' ? '↑' : '·',
          ax,
          arrowY,
        )
      }
    }

    ctx2d.restore()
  }

  // ─── Ball helpers ─────────────────────────────────────────────────────────────

  /**
   * Parabolic bounce: y = FLOOR at t=0 and t=1, y = CEIL at t=0.5.
   */
  function parabolaY(t: number): number {
    return BALL_FLOOR_Y - (BALL_FLOOR_Y - BALL_CEIL_Y) * 4 * t * (1 - t)
  }

  /**
   * Given a moment in time, compute the ball's y using the nearest pair of
   * scorable stroke times as the bounce interval.
   */
  function ballYAtTime(time: number, strokeTimes: number[]): number {
    if (strokeTimes.length === 0) return BALL_FLOOR_Y

    // Find the last stroke at or before `time`
    let prevIdx = -1
    for (let i = 0; i < strokeTimes.length; i++) {
      if (strokeTimes[i] <= time) prevIdx = i
      else break
    }

    let prevTime: number
    let nextTime: number

    if (prevIdx === -1) {
      // Before first stroke — extrapolate interval backwards
      const interval =
        strokeTimes.length > 1 ? strokeTimes[1] - strokeTimes[0] : 0.5
      prevTime = strokeTimes[0] - interval
      nextTime = strokeTimes[0]
    } else if (prevIdx === strokeTimes.length - 1) {
      // After last stroke
      return BALL_FLOOR_Y
    } else {
      prevTime = strokeTimes[prevIdx]
      nextTime = strokeTimes[prevIdx + 1]
    }

    const interval = nextTime - prevTime
    const t = interval > 0 ? (time - prevTime) / interval : 0
    return parabolaY(Math.max(0, Math.min(1, t)))
  }

  // ─── Ball + trajectory ────────────────────────────────────────────────────────

  function drawBallAndTrajectory(hitX: number, now: number, scrollSpeed: number, W: number) {
    if (!ctx2d) return

    // Collect all scorable stroke times (D and U only)
    const strokeTimes: number[] = []
    for (const bar of props.scheduledBars) {
      for (const t of bar.scorableStrokeTimes) {
        strokeTimes.push(t)
      }
    }
    strokeTimes.sort((a, b) => a - b)

    if (strokeTimes.length === 0) return

    // ── Dotted future trajectory ─────────────────────────────────────────────
    const LOOKAHEAD_PX = Math.min(W - hitX - 8, 320)
    const DOT_STEP = 4

    ctx2d.save()
    ctx2d.fillStyle = 'rgba(255,255,255,0.28)'
    for (let dx = DOT_STEP; dx < LOOKAHEAD_PX; dx += DOT_STEP) {
      const futureTime = now + dx / scrollSpeed
      const dotY = ballYAtTime(futureTime, strokeTimes)
      ctx2d.beginPath()
      ctx2d.arc(hitX + dx, dotY, 1.8, 0, Math.PI * 2)
      ctx2d.fill()
    }
    ctx2d.restore()

    // ── Ball at hit zone ──────────────────────────────────────────────────────
    const ballY = ballYAtTime(now, strokeTimes)

    ctx2d.save()
    // Glow
    ctx2d.shadowColor = 'rgba(255,255,255,0.55)'
    ctx2d.shadowBlur = 10
    ctx2d.fillStyle = '#ffffff'
    ctx2d.beginPath()
    ctx2d.arc(hitX, ballY, BALL_R, 0, Math.PI * 2)
    ctx2d.fill()
    ctx2d.restore()
  }

  // ─── Main render loop ─────────────────────────────────────────────────────────

  function drawFrame() {
    const canvas = canvasRef.value
    if (!canvas || !ctx2d) return

    const W = canvas.width
    const hitX = W * HIT_ZONE_X_RATIO
    const now = props.isRunning ? getAudioContext().currentTime : 0
    const scrollSpeed = PIXELS_PER_BEAT * (props.sessionBpm / 60)

    // Background
    ctx2d.fillStyle = '#0d0d0d'
    ctx2d.fillRect(0, 0, W, CANVAS_H)

    drawGuitarNeck(W)

    // Chord blocks
    for (const bar of props.scheduledBars) {
      const barDuration = bar.endAudioTime - bar.startAudioTime
      const blockW = barDuration * scrollSpeed
      const x = hitX + (bar.startAudioTime - now) * scrollSpeed

      if (x + blockW < 0 || x > W) continue

      const result = props.barResults.get(bar.barIndex)
      const color = result ? STATUS_COLORS[result.accuracy] : CHORD_COLORS[bar.chord]
      const dimmed = result !== undefined

      drawBlock(x, blockW, color, bar.chord, bar.strummingPattern as string[], dimmed, W)
    }

    // Hit zone line (drawn above blocks, below ball)
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

    // Bouncing ball + dotted trajectory (only while session is live)
    if (props.isRunning && props.sessionBpm > 0) {
      drawBallAndTrajectory(hitX, now, scrollSpeed, W)
    }

    rafId = requestAnimationFrame(drawFrame)
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  function startLoop() {
    if (rafId !== null) return
    rafId = requestAnimationFrame(drawFrame)
  }

  function stopLoop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
  }

  watch(() => props.isRunning, (running) => {
    if (running) startLoop()
    // Keep rendering after complete so final state is visible
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
    class="w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]"
    role="img"
    aria-label="Beat lane"
  >
    <canvas
      ref="canvasRef"
      class="block w-full"
      :height="160"
    />
  </div>
</template>
