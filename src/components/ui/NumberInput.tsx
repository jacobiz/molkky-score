import { useTranslation } from '../../utils/i18n'

interface NumberInputProps {
  onSubmit: (points: number) => void
  variant?: 'game' | 'molkkout'
}

export function NumberInput({ onSubmit, variant = 'game' }: NumberInputProps) {
  const { t } = useTranslation()
  const isMolkkout = variant === 'molkkout'

  return (
    <div className={`flex flex-col h-full ${isMolkkout ? 'gap-3 p-4' : 'gap-2 p-3'}`}>
      <p className="text-center text-base font-medium text-gray-700">
        {t.game.howMany}
      </p>

      {/* 0: full-width miss button */}
      <button
        onClick={() => onSubmit(0)}
        className={`shrink-0 w-full rounded-2xl bg-red-500 text-white font-bold active:bg-red-600 ${isMolkkout ? 'py-4 text-xl' : 'py-2 text-2xl'}`}
      >
        0
      </button>

      {/* 1–12: 4×3 grid */}
      <div className={`flex-1 min-h-0 grid grid-cols-4 grid-rows-3 gap-2 ${isMolkkout ? 'max-h-[280px]' : ''}`}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => onSubmit(n)}
            className={`min-h-[44px] rounded-xl bg-green-500 text-white font-bold active:bg-green-600 flex items-center justify-center ${isMolkkout ? 'py-4 text-xl' : 'text-2xl'}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
