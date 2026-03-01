import type { Player } from '../../types/game'
import { useTranslation } from '../../utils/i18n'

interface ScoreBoardProps {
  players: Player[]
  currentPlayerIndex: number
}

export function ScoreBoard({ players, currentPlayerIndex }: ScoreBoardProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {players.map((player, i) => {
        const isCurrent = i === currentPlayerIndex && player.status === 'active'
        const isEliminated = player.status === 'eliminated'
        const isWinner = player.status === 'winner'
        const isMissWarning = player.consecutiveMisses === 2
        const remaining = 50 - player.score
        const isCloseToWin = remaining <= 12 && !isEliminated && !isWinner

        return (
          <div
            key={player.id}
            className={`
              flex items-center gap-3 px-4 py-2 transition-colors
              ${isCurrent ? 'bg-blue-50' : ''}
              ${isEliminated ? 'bg-gray-50 opacity-60' : ''}
              ${isMissWarning && !isEliminated ? 'bg-amber-50' : ''}
              ${isWinner ? 'bg-green-50' : ''}
            `}
          >
            {/* Current turn indicator */}
            <div className="w-2">
              {isCurrent && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>

            {/* Name */}
            <span
              className={`
                flex-1 text-lg font-medium truncate
                ${isEliminated ? 'line-through text-gray-400' : 'text-gray-900'}
                ${isWinner ? 'font-bold text-green-700' : ''}
              `}
            >
              {player.name}
            </span>

            {/* Eliminated badge */}
            {isEliminated && (
              <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                ❌ {t.game.eliminated}
              </span>
            )}

            {/* Miss count */}
            {!isEliminated && (
              <span
                className={`
                  text-sm px-2 py-0.5 rounded-full
                  ${isMissWarning
                    ? 'bg-amber-100 text-amber-700 font-semibold'
                    : 'bg-gray-100 text-gray-500'}
                `}
              >
                {t.game.misses} {player.consecutiveMisses}
              </span>
            )}

            {/* Score */}
            <div className="text-right min-w-16">
              <p className="font-bold text-gray-900">
                <span className="text-xl">{player.score}</span>
                {!isEliminated && (
                  <span className={`text-xs ml-1 font-normal ${isCloseToWin ? 'text-orange-600 font-semibold' : 'text-gray-400'}`}>
                    /{remaining}
                  </span>
                )}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
