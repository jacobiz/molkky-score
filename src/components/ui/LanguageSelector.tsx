import type { Language } from '../../types/game'

interface Props {
  current: Language
  onSelect: (lang: Language) => void
  className?: string
}

const LANGUAGES: Language[] = ['ja', 'en', 'fi']
const CODES: Record<Language, string> = { ja: 'JA', en: 'EN', fi: 'FI' }

function FlagJP() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
      <rect width="20" height="14" fill="#ffffff" stroke="#d1d5db" strokeWidth="0.5" />
      <circle cx="10" cy="7" r="4.2" fill="#BC002D" />
    </svg>
  )
}

function FlagGB() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
      <rect width="20" height="14" fill="#012169" />
      {/* White diagonals */}
      <line x1="0" y1="0" x2="20" y2="14" stroke="white" strokeWidth="4.5" />
      <line x1="20" y1="0" x2="0" y2="14" stroke="white" strokeWidth="4.5" />
      {/* Red diagonals */}
      <line x1="0" y1="0" x2="20" y2="14" stroke="#C8102E" strokeWidth="2" />
      <line x1="20" y1="0" x2="0" y2="14" stroke="#C8102E" strokeWidth="2" />
      {/* White cross */}
      <rect x="0" y="5" width="20" height="4" fill="white" />
      <rect x="8" y="0" width="4" height="14" fill="white" />
      {/* Red cross */}
      <rect x="0" y="5.75" width="20" height="2.5" fill="#C8102E" />
      <rect x="8.75" y="0" width="2.5" height="14" fill="#C8102E" />
    </svg>
  )
}

function FlagFI() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
      <rect width="20" height="14" fill="#ffffff" stroke="#d1d5db" strokeWidth="0.5" />
      {/* Nordic cross — horizontal bar */}
      <rect x="0" y="5" width="20" height="4" fill="#003580" />
      {/* Nordic cross — vertical bar (offset to hoist side) */}
      <rect x="5" y="0" width="4" height="14" fill="#003580" />
    </svg>
  )
}

const FLAG_COMPONENTS: Record<Language, () => JSX.Element> = {
  ja: FlagJP,
  en: FlagGB,
  fi: FlagFI,
}

export function LanguageSelector({ current, onSelect, className }: Props) {
  return (
    <div className={`flex gap-1 ${className ?? ''}`}>
      {LANGUAGES.map(lang => {
        const active = current === lang
        const Flag = FLAG_COMPONENTS[lang]
        return (
          <button
            key={lang}
            onClick={() => onSelect(lang)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-medium ${
              active
                ? 'bg-blue-500 text-white'
                : 'border border-gray-300 text-gray-600 bg-white'
            }`}
          >
            <Flag />
            <span>{CODES[lang]}</span>
          </button>
        )
      })}
    </div>
  )
}
