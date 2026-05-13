import { useState } from 'react'
import AllActivities from '../components/AllActivities'

export default function MainPage() {
  const [count, setCount] = useState(0)

  return (
    <>
      <main>
        <section className="zzbanner">
        </section>
        
        <AllActivities />

        <section>
          <div className="card">
            <p className="warning">Vous avez déjà des ennuis. Désormais, il faut survivre.</p>
            <button onClick={() => setCount((count) => count + 1)} type="button">
              count is {count}
            </button>
            <p>
              <i>useState counter test</i>
            </p>
            <p>
              Edit <code>src/App.tsx</code> and save to test the Hot Module Replacement (HMR)
            </p>
          </div>
        </section>
      </main>
    </>
  )
}