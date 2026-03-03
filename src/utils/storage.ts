import type { GameState, Game, MolkkoutGame, Settings } from '../types/game'

const STORAGE_KEY = 'molkky-score-v2'
// SCHEMA_VERSION: 2 → 3 (MolkkoutGame の shape 変更 — playerNames/throwsPerPlayer 廃止)
// SCHEMA_VERSION: 3 → 4 (Game・MolkkoutGame に finishReason フィールド追加)
// STORAGE_KEY は変更しない（バージョンフィールドで十分, research.md 参照）
const SCHEMA_VERSION = 4

interface StoredState {
  version: typeof SCHEMA_VERSION
  game: Game | null
  molkkoutGame: MolkkoutGame | null
  settings: Settings
}

export function saveState(state: GameState): void {
  const stored: StoredState = {
    version: SCHEMA_VERSION,
    game: state.game,
    molkkoutGame: state.molkkoutGame,
    settings: state.settings,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // storage unavailable（プライベートブラウズ等）
  }
}

function isValidStoredState(value: unknown): value is StoredState {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  if (v.version !== SCHEMA_VERSION) return false
  if (typeof v.settings !== 'object' || v.settings === null) return false
  return true
}

export function loadState(): Pick<GameState, 'game' | 'molkkoutGame' | 'settings'> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isValidStoredState(parsed)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return {
      game: parsed.game ?? null,
      molkkoutGame: parsed.molkkoutGame ?? null,
      settings: parsed.settings,
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}
