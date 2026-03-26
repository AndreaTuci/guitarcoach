// Configurable logger — use this instead of console.log in all production code.
// Set VITE_LOG_LEVEL in .env to control output ('debug' | 'info' | 'warn' | 'error' | 'silent').

type Level = 'debug' | 'info' | 'warn' | 'error' | 'silent'

const LEVELS: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 }

const configured = (import.meta.env.VITE_LOG_LEVEL ?? 'warn') as Level
const threshold = LEVELS[configured] ?? LEVELS.warn

export const logger = {
  debug: (...args: unknown[]) => threshold <= LEVELS.debug && console.debug('[gc]', ...args),
  info: (...args: unknown[]) => threshold <= LEVELS.info && console.info('[gc]', ...args),
  warn: (...args: unknown[]) => threshold <= LEVELS.warn && console.warn('[gc]', ...args),
  error: (...args: unknown[]) => threshold <= LEVELS.error && console.error('[gc]', ...args),
}
