import { useGame } from './context/GameContext'
import { HomeScreen } from './components/HomeScreen'
import { SetupScreen } from './components/SetupScreen'
import { GameScreen } from './components/GameScreen'
import { ResultScreen } from './components/ResultScreen'
import { MolkkoutSetupScreen } from './components/MolkkoutSetupScreen'
import { MolkkoutScreen } from './components/MolkkoutScreen'

function App() {
  const { state } = useGame()

  return (
    <>
      {state.screen === 'home' && <HomeScreen />}
      {state.screen === 'setup' && <SetupScreen />}
      {state.screen === 'game' && <GameScreen />}
      {state.screen === 'result' && <ResultScreen />}
      {state.screen === 'molkkout-setup' && <MolkkoutSetupScreen />}
      {state.screen === 'molkkout-game' && <MolkkoutScreen />}
    </>
  )
}

export default App
