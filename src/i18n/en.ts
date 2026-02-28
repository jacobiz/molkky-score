import type { Messages } from './ja'

function ordinal(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}

export const en: Messages = {
  home: {
    title: 'Mölkky Score',
    newGame: 'New Game',
    resumeGame: 'Resume Game',
    overwriteConfirm: 'Current game will be lost. Continue?',
    confirmYes: 'Continue',
    confirmNo: 'Cancel',
  },
  setup: {
    title: 'Player Setup',
    namePlaceholder: 'Player name (max 12 chars)',
    addPlayer: 'Add',
    startGame: 'Start Game',
    errorMinPlayers: 'At least 2 players required',
    errorMaxPlayers: 'Maximum 6 players allowed',
    errorDuplicate: 'This name is already registered',
    errorMaxLength: 'Player name must be 12 characters or less',
    orderHint: 'Use buttons to change throw order',
  },
  game: {
    currentTurn: "{name}'s turn",
    score: 'Score',
    remaining: 'Remaining',
    misses: 'Misses',
    eliminated: 'Eliminated',
    undo: 'Undo',
    howMany: 'How many pins?',
    whichPin: 'Which pin?',
    bustMessage: 'Bust! Reset to 25',
    eliminatedMessage: '{name} is eliminated',
    winnerMessage: '{name} wins!',
  },
  result: {
    title: 'Game Over',
    winner: 'Winner: {name}',
    totalTurns: '{n} turns',
    playAgain: 'Play Again',
    newGame: 'New Game',
    share: 'Share Results',
    sharePrefix: '🎯 Mölkky Results',
    eliminated: 'eliminated',
    turns: 'turns',
    rankSuffix: (n: number) => ordinal(n),
  },
  molkkout: {
    title: 'Mölkkout (Tiebreaker)',
    pinSetupGuide: 'Set up pins in this order: 6-4-12-10-8',
    start: 'Start',
    teamTurn: "{team}'s turn ({player})",
    totalScore: 'Total: {score}pt',
    winner: '{team} wins!',
    overtime: 'Tie! Overtime',
  },
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    copied: 'Copied to clipboard',
    language: 'Language',
  },
}
