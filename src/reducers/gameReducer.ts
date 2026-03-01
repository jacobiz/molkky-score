import { applyBustRule, checkWin, incrementMisses } from '../utils/scoring'
import type { GameState, GameAction, GameStatus, Player, PlayerStatus, Game } from '../types/game'

export const initialState: GameState = {
  screen: 'home',
  game: null,
  molkkoutGame: null,
  settings: { language: 'ja' },
  rematchPlayers: null,
}

// ─── helpers ───────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

/** active なプレイヤーのインデックスを順番に返す（脱落者をスキップ） */
function nextActiveIndex(players: Player[], currentIndex: number): number {
  const count = players.length
  for (let i = 1; i <= count; i++) {
    const idx = (currentIndex + i) % count
    if (players[idx].status === 'active') return idx
  }
  return currentIndex
}

/** active なプレイヤーの数 */
function activeCount(players: Player[]): number {
  return players.filter(p => p.status === 'active').length
}

// ─── reducer ───────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, screen: action.screen }

    case 'START_GAME': {
      const players: Player[] = action.playerNames.map(name => ({
        id: generateId(),
        name,
        score: 0,
        consecutiveMisses: 0,
        status: 'active',
      }))
      const game: Game = {
        players,
        currentPlayerIndex: 0,
        status: 'active',
        winnerId: null,
        totalTurns: 0,
        turnHistory: [],
      }
      return { ...state, screen: 'game', game, rematchPlayers: null }
    }

    case 'RECORD_TURN': {
      const game = state.game
      if (!game || game.status === 'finished') return state

      const { points } = action
      const idx = game.currentPlayerIndex
      const player = game.players[idx]

      const isMiss = points === 0
      const newScore = applyBustRule(player.score, points)
      const isBust = !isMiss && newScore === 25 && player.score + points > 50

      // ミスカウンタ
      let newMisses = player.consecutiveMisses
      let newStatus: PlayerStatus = player.status
      if (isMiss) {
        const result = incrementMisses(newMisses)
        if (result === 'eliminated') {
          newStatus = 'eliminated'
          newMisses = 3
        } else {
          newMisses = result
        }
      } else {
        newMisses = 0
      }

      // 勝利判定（得点後のみ）
      if (!isMiss && checkWin(newScore)) {
        newStatus = 'winner'
      }

      const updatedPlayer: Player = {
        ...player,
        score: newScore,
        consecutiveMisses: newMisses,
        status: newStatus,
      }

      const updatedPlayers = game.players.map((p, i) =>
        i === idx ? updatedPlayer : p,
      )

      // 最後の1人チェック
      const remaining = updatedPlayers.filter(p => p.status === 'active')
      let finalPlayers = updatedPlayers
      let winnerId = game.winnerId
      let gameStatus: GameStatus = game.status

      if (newStatus === 'winner' || (remaining.length === 1 && activeCount(game.players) > 1)) {
        const winner =
          newStatus === 'winner'
            ? updatedPlayer
            : remaining[0]
        finalPlayers = updatedPlayers.map(p =>
          p.id === winner.id ? { ...p, status: 'winner' } : p,
        )
        winnerId = winner.id
        gameStatus = 'finished'
      }

      const turn = {
        playerId: player.id,
        points,
        isBust,
        isMiss,
        playerSnapshotBefore: { ...player },
      }

      const nextIdx =
        gameStatus === 'finished'
          ? idx
          : nextActiveIndex(finalPlayers, idx)

      const updatedGame: Game = {
        ...game,
        players: finalPlayers,
        currentPlayerIndex: nextIdx,
        status: gameStatus,
        winnerId,
        totalTurns: game.totalTurns + 1,
        turnHistory: [...game.turnHistory, turn],
      }

      return {
        ...state,
        screen: gameStatus === 'finished' ? 'result' : state.screen,
        game: updatedGame,
      }
    }

    case 'UNDO_TURN': {
      const game = state.game
      if (!game || game.turnHistory.length === 0) return state

      const history = [...game.turnHistory]
      const lastTurn = history.pop()!

      const restoredPlayers = game.players.map(p =>
        p.id === lastTurn.playerId ? { ...lastTurn.playerSnapshotBefore } : p,
      )

      // 勝利によって screen が変わっていた場合は game に戻す
      const prevScreen = state.screen === 'result' ? 'game' : state.screen

      const updatedGame: Game = {
        ...game,
        players: restoredPlayers,
        currentPlayerIndex: game.players.findIndex(
          p => p.id === lastTurn.playerId,
        ),
        status: 'active',
        winnerId: null,
        totalTurns: game.totalTurns - 1,
        turnHistory: history,
      }

      return { ...state, screen: prevScreen, game: updatedGame }
    }

    case 'RESTART_GAME': {
      const game = state.game
      if (!game) return state

      const resetPlayers: Player[] = game.players.map(p => ({
        ...p,
        score: 0,
        consecutiveMisses: 0,
        status: 'active',
      }))
      const restartedGame: Game = {
        players: resetPlayers,
        currentPlayerIndex: 0,
        status: 'active',
        winnerId: null,
        totalTurns: 0,
        turnHistory: [],
      }
      return { ...state, screen: 'game', game: restartedGame }
    }

    case 'NEW_GAME':
      return { ...state, screen: 'setup', game: null }

    case 'REMATCH_SETUP': {
      const game = state.game
      if (!game) return state
      return {
        ...state,
        screen: 'setup',
        rematchPlayers: game.players.map(p => p.name),
      }
    }

    case 'START_MOLKKOUT': {
      const teams = action.teams.map(t => ({
        id: generateId(),
        name: t.name,
        playerNames: t.playerNames,
        totalScore: 0,
      }))
      const throwsPerPlayer =
        action.teams[0].playerNames.length === 1
          ? 3
          : action.teams[0].playerNames.length === 2
            ? 2
            : 1
      return {
        ...state,
        screen: 'molkkout-game',
        molkkoutGame: {
          teams,
          currentTeamIndex: 0,
          currentPlayerInTeamIndex: 0,
          throwsPerPlayer,
          turns: [],
          status: 'active',
          winnerId: null,
        },
      }
    }

    case 'RECORD_MOLKKOUT_TURN': {
      const mg = state.molkkoutGame
      if (!mg || mg.status === 'finished') return state

      const { points } = action
      const team = mg.teams[mg.currentTeamIndex]

      const turn = {
        teamId: team.id,
        playerName: team.playerNames[mg.currentPlayerInTeamIndex],
        points,
      }

      const updatedTeams = mg.teams.map(t =>
        t.id === team.id ? { ...t, totalScore: t.totalScore + points } : t,
      )

      const updatedTurns = [...mg.turns, turn]

      // 次の投球者を決定
      const nextPlayerIdx = mg.currentPlayerInTeamIndex + 1
      const isTeamDone = nextPlayerIdx >= team.playerNames.length * mg.throwsPerPlayer
      const nextTeamIdx = isTeamDone ? (mg.currentTeamIndex + 1) % mg.teams.length : mg.currentTeamIndex
      const nextPlayerInTeam = isTeamDone ? 0 : nextPlayerIdx

      // 全チームが投球完了したか
      const allDone = isTeamDone && nextTeamIdx === 0

      let newStatus: 'active' | 'finished' | 'overtime' = mg.status
      let winnerId = mg.winnerId

      if (allDone) {
        const maxScore = Math.max(...updatedTeams.map(t => t.totalScore))
        const winners = updatedTeams.filter(t => t.totalScore === maxScore)
        if (winners.length === 1) {
          newStatus = 'finished'
          winnerId = winners[0].id
        } else {
          newStatus = 'overtime'
        }
      }

      return {
        ...state,
        molkkoutGame: {
          ...mg,
          teams: updatedTeams,
          currentTeamIndex: nextTeamIdx,
          currentPlayerInTeamIndex: nextPlayerInTeam,
          turns: updatedTurns,
          status: newStatus,
          winnerId,
        },
      }
    }

    case 'SET_LANGUAGE':
      return { ...state, settings: { ...state.settings, language: action.language } }

    default:
      return state
  }
}
