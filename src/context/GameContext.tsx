import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react'
import { gameReducer, initialState } from '../reducers/gameReducer'
import { saveState, loadState } from '../utils/storage'
import { addRecord, buildHistoryRecord } from '../utils/historyStorage'
import { detectLocale } from '../utils/i18n'
import type { GameState, GameAction } from '../types/game'

interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<GameAction>
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (init) => {
    const saved = loadState()
    if (!saved) return { ...init, settings: { language: detectLocale() } }
    return { ...init, ...saved }
  })

  // ゲームが 'active' → 'finished' に遷移したときのみ履歴を保存する
  // 初期値を現在の状態で初期化することで、アプリ再起動時の二重保存を防ぐ
  const prevGameStatusRef = useRef(state.game?.status ?? null)
  useEffect(() => {
    const prevStatus = prevGameStatusRef.current
    const currentStatus = state.game?.status ?? null
    if (prevStatus !== 'finished' && currentStatus === 'finished' && state.game) {
      addRecord(buildHistoryRecord(state.game))
    }
    prevGameStatusRef.current = currentStatus
  }, [state.game])

  useEffect(() => {
    saveState(state)
  }, [state])

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
