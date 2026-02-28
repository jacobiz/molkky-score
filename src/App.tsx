import { useGame } from './context/GameContext'

// コンポーネントは各フェーズで実装する（Phase 3〜10）
// 現時点はルーティングのプレースホルダー

function App() {
  const { state } = useGame()

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* screen: {state.screen} */}
      <p className="p-4 text-sm text-gray-400">screen: {state.screen}</p>
    </div>
  )
}

export default App
