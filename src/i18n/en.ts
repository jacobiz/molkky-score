import type { Messages } from "./ja";

function ordinal(n: number): string {
  if (n === 1) return "st";
  if (n === 2) return "nd";
  if (n === 3) return "rd";
  return `th`;
}

export const en: Messages = {
  home: {
    title: "Mölkky Score",
    newGame: "New Game",
    resumeGame: "Resume Game",
    overwriteConfirm: "Current game will be lost. Continue?",
    confirmYes: "Continue",
    confirmNo: "Cancel",
  },
  setup: {
    title: "Player Setup",
    namePlaceholder: "Player name (max 12 chars)",
    addPlayer: "Add",
    startGame: "Start Game",
    errorMinPlayers: "At least 2 players required",
    errorMaxPlayers: "Maximum 10 players allowed",
    errorDuplicate: "This name is already registered",
    errorMaxLength: "Player name must be 12 characters or less",
    orderHint: "Use buttons to change throw order",
    shuffle: "Shuffle",
    moveUp: "Move up",
    moveDown: "Move down",
    removePlayer: "Remove",
  },
  game: {
    title: "Game",
    currentTurn: "{name}'s turn",
    score: "Score",
    remaining: "Remaining",
    misses: "Misses",
    eliminated: "Eliminated",
    undo: "Undo",
    throwCount: (n: number) => `${n}${ordinal(n)} throw`,
    howMany: "Score?",
    bustMessage: "💥 Bust! Reset to 25",
    eliminatedMessage: "❌ {name} is eliminated",
    winnerMessage: "{name} wins!",
  },
  result: {
    title: "Game Over",
    winner: "Winner: {name}",
    totalTurns: "{n} turns",
    playAgain: "Play Again",
    newGame: "New Game",
    share: "Share Results",
    sharePrefix: "🎯 Mölkky Results",
    eliminated: "eliminated",
    turns: "turns",
    rankSuffix: (n: number) => ordinal(n),
    scoreUnit: "pt",
  },
  molkkout: {
    title: "Mölkkout (Tiebreaker)",
    pinSetupGuide: "Set up pins in this order: 6-4-12-10-8",
    start: "Start",
    teamTurn: "{team}'s turn ({player})",
    totalScore: "Total: {score}pt",
    winner: "{team} wins!",
    overtime: "Tie! Overtime",
    errorRequiredFields: "Please fill in all team and player names",
  },
  common: {
    ok: "OK",
    cancel: "Cancel",
    copied: "Copied to clipboard",
    language: "Language",
    backToHome: "Back to Home",
    backToHomeConfirm: "Return to home?",
  },
  install: {
    link: "📲 How to Install",
    title: "How to Install",
    ios: "iOS Safari",
    iosStep1: "Tap the share button (□↑) at the bottom of the screen",
    iosStep2: "Select \"Add to Home Screen\"",
    iosStep3: "Tap \"Add\" in the top right",
    android: "Android Chrome",
    androidStep1: "Tap the ⋮ menu in the top right",
    androidStep2: "Select \"Install app\" or \"Add to Home Screen\"",
  },
  licenses: {
    title: "Open Source Licenses",
    backLabel: "Back",
    showFullText: "Show full license text",
    privacyTitle: "Privacy Policy",
    privacyBody: "This app does not send any user data to external servers. Scores and settings are stored only in this device's localStorage.",
  },
};
