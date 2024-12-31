import { fetchApi } from '@packages/core'
import { Button } from '@packages/ui'
import { useState } from 'react'
import './App.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)
  const [apiResult, setApiResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testApi = async () => {
    setIsLoading(true)
    const response = await fetchApi<{ message: string }>('/')
    setApiResult(response.data?.message || response.error || 'No response')
    setIsLoading(false)
  }

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
      <div className="card">
        <Button variant="secondary" onPress={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <Button onPress={testApi}>
          Test API
        </Button>
        <p>
          {isLoading ? 'Loading...' : apiResult || ' '}
        </p>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
