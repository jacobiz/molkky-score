import { applyBustRule, checkWin, incrementMisses, isBustThrow } from '../utils/scoring'
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
      const isBust = isBustThrow(player.score, points)

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
        totalScore: 0,
      }))
      return {
        ...state,
        screen: 'molkkout-game',
        molkkoutGame: {
          teams,
          currentTeamIndex: 0,
          currentThrowIndex: 0,
          totalThrows: action.totalThrows,
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
        points,
        teamIndex: mg.currentTeamIndex,
        throwIndex: mg.currentThrowIndex,
        prevStatus: mg.status as 'active' | 'overtime',
      }

      const updatedTeams = mg.teams.map(t =>
        t.id === team.id ? { ...t, totalScore: t.totalScore + points } : t,
      )

      const updatedTurns = [...mg.turns, turn]

      // 1投ごとに次のチームへ移るラウンドロビン方式
      const nextTeamIdx = (mg.currentTeamIndex + 1) % mg.teams.length
      const completedRound = nextTeamIdx === 0  // 全チームが1投完了 = 1ラウンド終了
      const nextThrowIdx = completedRound
        ? mg.currentThrowIndex + 1
        : mg.currentThrowIndex

      // 全ラウンド完了したか（totalThrows ラウンド × 全チーム）
      const allDone = completedRound && nextThrowIdx >= mg.totalThrows

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
          currentThrowIndex: nextThrowIdx,
          turns: updatedTurns,
          status: newStatus,
          winnerId,
        },
      }
    }

    case 'UNDO_MOLKKOUT_TURN': {
      const mg = state.molkkoutGame
      if (!mg || mg.turns.length === 0) return state

      const history = [...mg.turns]
      const lastTurn = history.pop()!

      const restoredTeams = mg.teams.map(t =>
        t.id === lastTurn.teamId
          ? { ...t, totalScore: t.totalScore - lastTurn.points }
          : t,
      )

      return {
        ...state,
        molkkoutGame: {
          ...mg,
          teams: restoredTeams,
          currentTeamIndex: lastTurn.teamIndex,
          currentThrowIndex: lastTurn.throwIndex,
          status: lastTurn.prevStatus,
          winnerId: null,
          turns: history,
        },
      }
    }

    case 'SET_LANGUAGE':
      return { ...state, settings: { ...state.settings, language: action.language } }

    default:
      return state
  }
}
