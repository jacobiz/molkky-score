import { gameReducer, initialState } from '../../src/reducers/gameReducer'
import type { GameState } from '../../src/types/game'

export function startGame(names: string[]): GameState {
  return gameReducer(initialState, { type: 'START_GAME', playerNames: names })
}

export function recordTurn(state: GameState, points: number): GameState {
  return gameReducer(state, { type: 'RECORD_TURN', points })
}
