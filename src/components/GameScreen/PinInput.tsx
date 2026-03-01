import { useTranslation } from '../../utils/i18n'

interface PinInputProps {
  onSubmit: (points: number) => void
}

export function PinInput({ onSubmit }: PinInputProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2 p-3 h-full">
      <p className="text-center text-base font-medium text-gray-700">
        {t.game.howMany}
      </p>

      {/* 0: full-width miss button */}
      <button
        onClick={() => onSubmit(0)}
        className="shrink-0 w-full py-2 rounded-2xl bg-red-500 text-white text-2xl font-bold active:bg-red-600"
      >
        0
      </button>

      {/* 1–12: 4×3 grid */}
      <div className="flex-1 min-h-0 grid grid-cols-4 grid-rows-3 gap-2">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => onSubmit(n)}
            className="min-h-[44px] rounded-xl bg-green-500 text-white text-2xl font-bold active:bg-green-600 flex items-center justify-center"
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
