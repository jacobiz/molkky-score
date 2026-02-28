import type { Player } from '../types/game'
import type { Messages } from '../i18n/ja'

interface ShareOptions {
  players: Player[]
  totalTurns: number
  t: Messages
}

function buildRanking(players: Player[]): Player[] {
  const active = players
    .filter(p => p.status !== 'eliminated')
    .sort((a, b) => b.score - a.score)
  const eliminated = players.filter(p => p.status === 'eliminated')
  return [...active, ...eliminated]
}

export function buildShareText({ players, totalTurns, t }: ShareOptions): string {
  const ranked = buildRanking(players)

  const lines = ranked.map((player, i) => {
    const rank = i + 1
    const suffix = t.result.rankSuffix(rank)
    const scoreStr =
      player.status === 'eliminated'
        ? t.result.eliminated
        : `${player.score}pt`
    const trophy = player.status === 'winner' ? ' 🏆' : ''
    return `${rank}${suffix} ${player.name} ${scoreStr}${trophy}`
  })

  return [
    t.result.sharePrefix,
    ...lines,
    `(${t.result.totalTurns.replace('{n}', String(totalTurns))})`,
  ].join('\n')
}

export async function shareResult(
  text: string,
  onCopied: () => void,
): Promise<void> {
  if (navigator.share) {
    await navigator.share({ text })
  } else {
    await navigator.clipboard.writeText(text)
    onCopied()
  }
}
