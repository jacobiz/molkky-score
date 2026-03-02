import { useTranslation } from '../utils/i18n'

interface Library {
  name: string
  version: string
  copyright: string
  url: string
}

const LIBRARIES: Library[] = [
  {
    name: 'React',
    version: '19.2.4',
    copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
    url: 'https://react.dev',
  },
  {
    name: 'Workbox',
    version: '7.4.0',
    copyright: 'Copyright 2018 Google LLC',
    url: 'https://developer.chrome.com/docs/workbox',
  },
  {
    name: 'Tailwind CSS',
    version: '4.2.1',
    copyright: 'Copyright (c) Tailwind Labs, Inc.',
    url: 'https://tailwindcss.com',
  },
]

const MIT_BODY =
  'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.'

interface Props {
  onBack: () => void
}

export function LicensesScreen({ onBack }: Props) {
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg text-gray-500 active:bg-gray-100"
          aria-label={t.licenses.backLabel}
        >
          ←
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {t.licenses.title}
        </h1>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {LIBRARIES.map((lib) => (
          <div key={lib.name} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-semibold text-gray-900">{lib.name}</span>
              <span className="text-xs text-gray-400">v{lib.version}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">MIT License — {lib.copyright}</p>
            <details className="group">
              <summary className="text-xs text-blue-500 cursor-pointer select-none">
                {t.licenses.showFullText}
              </summary>
              <pre className="mt-2 text-xs text-gray-500 whitespace-pre-wrap leading-relaxed font-sans">
                {lib.copyright}
                {'\n\n'}
                {MIT_BODY}
              </pre>
            </details>
          </div>
        ))}

        {/* This app's own license */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-semibold text-gray-900">Mölkky スコア</span>
            <span className="text-xs text-gray-400">v{__APP_VERSION__}</span>
          </div>
          <p className="text-xs text-gray-500">MIT License — Copyright (c) 2026 jacobiz</p>
        </div>

        {/* Privacy policy */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-2">
            {t.licenses.privacyTitle}
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            {t.licenses.privacyBody}
          </p>
        </div>
      </div>
    </div>
  )
}
