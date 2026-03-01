import { useTranslation } from '../../utils/i18n'

interface InstallHelpModalProps {
  onClose: () => void
}

export function InstallHelpModal({ onClose }: InstallHelpModalProps) {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[80dvh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-gray-900">{t.install.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-5">
          {/* iOS */}
          <section>
            <h3 className="font-semibold text-gray-800 mb-2">{t.install.ios}</h3>
            <ol className="list-decimal list-inside flex flex-col gap-1 text-sm text-gray-700">
              <li>{t.install.iosStep1}</li>
              <li>{t.install.iosStep2}</li>
              <li>{t.install.iosStep3}</li>
            </ol>
          </section>

          {/* Android */}
          <section>
            <h3 className="font-semibold text-gray-800 mb-2">{t.install.android}</h3>
            <ol className="list-decimal list-inside flex flex-col gap-1 text-sm text-gray-700">
              <li>{t.install.androidStep1}</li>
              <li>{t.install.androidStep2}</li>
            </ol>
          </section>

          {/* OK button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold active:bg-blue-600"
          >
            {t.common.ok}
          </button>
        </div>
      </div>
    </div>
  )
}
