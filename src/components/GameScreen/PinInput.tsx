import { useState } from 'react'
import { useTranslation } from '../../utils/i18n'

interface PinInputProps {
  onSubmit: (pinsKnockedDown: number, pinNumber: number | null) => void
}

export function PinInput({ onSubmit }: PinInputProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState<'howMany' | 'whichPin'>('howMany')
  const [pinsKnockedDown, setPinsKnockedDown] = useState<number | null>(null)

  function handleCountSelect(count: number) {
    if (count === 1) {
      setPinsKnockedDown(1)
      setStep('whichPin')
    } else {
      onSubmit(count, null)
    }
  }

  function handlePinSelect(pin: number) {
    onSubmit(1, pin)
    setStep('howMany')
    setPinsKnockedDown(null)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {step === 'howMany' ? (
        <>
          <p className="text-center text-base font-medium text-gray-700">
            {t.game.howMany}
          </p>
          {/* 0–12 buttons in rows */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 13 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleCountSelect(i)}
                className={`
                  aspect-square rounded-xl text-lg font-bold
                  flex items-center justify-center
                  ${i === 0
                    ? 'bg-red-100 text-red-600 col-span-7 aspect-auto py-3'
                    : 'bg-white border border-gray-200 text-gray-800 active:bg-blue-50'}
                `}
              >
                {i}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setStep('howMany'); setPinsKnockedDown(null) }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
              aria-label="戻る"
            >
              ←
            </button>
            <p className="flex-1 text-center text-base font-medium text-gray-700">
              {t.game.whichPin}
            </p>
          </div>
          {/* Pin 1–12 */}
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(pin => (
              <button
                key={pin}
                onClick={() => handlePinSelect(pin)}
                className="aspect-square rounded-xl text-xl font-bold bg-white border border-gray-200 text-gray-800 flex items-center justify-center active:bg-blue-50"
              >
                {pin}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
