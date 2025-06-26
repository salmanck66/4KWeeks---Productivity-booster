import { useState } from 'react'
import WeeksRemainingApp from './components/WeeksRemainingApp'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <WeeksRemainingApp />
    </>
  )
}

export default App
