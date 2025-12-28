import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-4xl">YouTube RSS</h1>
      <div>
        <button className="btn btn-primary" onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App
