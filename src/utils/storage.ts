import type { GameState, Game, MolkkoutGame, Settings } from '../types/game'

const STORAGE_KEY = 'molkky-score-v2'
const SCHEMA_VERSION = 2

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

export function loadState(): Pick<GameState, 'game' | 'molkkoutGame' | 'settings'> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredState
    if (parsed.version !== SCHEMA_VERSION) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return {
      game: parsed.game ?? null,
      molkkoutGame: parsed.molkkoutGame ?? null,
      settings: parsed.settings ?? { language: 'ja' },
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}
