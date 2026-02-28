import { useGame } from '../context/GameContext'
import { ja } from '../i18n/ja'
import { en } from '../i18n/en'

export function useTranslation() {
  const { state } = useGame()
  const t = state.settings.language === 'en' ? en : ja
  return { t }
}
