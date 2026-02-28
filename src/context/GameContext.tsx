import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { gameReducer, initialState } from '../reducers/gameReducer'
import { saveState, loadState } from '../utils/storage'
import type { GameState, GameAction } from '../types/game'

interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<GameAction>
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (init) => {
    const saved = loadState()
    if (!saved) return init
    return { ...init, ...saved }
  })

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
