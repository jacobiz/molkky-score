import { useState } from 'react'
import { useTranslation } from '../../utils/i18n'

interface MolkkoutInputProps {
  onSubmit: (pinsKnockedDown: number, pinNumber: number | null) => void
}

export function MolkkoutInput({ onSubmit }: MolkkoutInputProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState<'howMany' | 'whichPin'>('howMany')

  function handleCountSelect(count: number) {
    if (count === 1) {
      setStep('whichPin')
    } else {
      onSubmit(count, null)
    }
  }

  function handlePinSelect(pin: number) {
    onSubmit(1, pin)
    setStep('howMany')
  }

  // Mölkkout pins: 6-4-12-10-8
  const molkkoutPins = [6, 4, 12, 10, 8]

  return (
    <div className="flex flex-col gap-4 p-4">
      {step === 'howMany' ? (
        <>
          <p className="text-center text-base font-medium text-gray-700">
            {t.game.howMany}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleCountSelect(0)}
              className="col-span-3 py-3 rounded-xl bg-red-100 text-red-600 text-lg font-bold"
            >
              0
            </button>
            <button
              onClick={() => handleCountSelect(1)}
              className="py-4 rounded-xl bg-white border border-gray-200 text-xl font-bold text-gray-800 active:bg-blue-50"
            >
              1
            </button>
            {[2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => handleCountSelect(n)}
                className="py-4 rounded-xl bg-white border border-gray-200 text-xl font-bold text-gray-800 active:bg-blue-50"
              >
                {n}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep('howMany')}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
            >
              ←
            </button>
            <p className="flex-1 text-center text-base font-medium text-gray-700">
              {t.game.whichPin}
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {molkkoutPins.map(pin => (
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
