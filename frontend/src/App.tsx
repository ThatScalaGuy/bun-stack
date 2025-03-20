import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useBackend } from './context/BackendContext'

function App() {
  const [count, setCount] = useState(0)
  const [greeting, setGreeting] = useState<string | null>(null)
  const backend = useBackend()

  useEffect(() => {
    // Example of using the treaty client through the hook
    const fetchGreeting = async () => {
      try {
        const response = await backend.hi.get()
        if (response.data) {
          setGreeting(response.data)
        }
      } catch (error) {
        console.error('Error fetching greeting:', error)
      }
    }

    fetchGreeting()
  }, [backend])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      {greeting && <p>Backend says: {greeting}</p>}
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      Hello 2
    </>
  )
}

export default App
