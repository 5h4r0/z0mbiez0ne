import { useState } from 'react'
import './App.css'

// importing the React Router components used to define our routes
import { Route, Routes } from 'react-router'

// import of sub-components that are defined in other files and that correspond to a piece of the interface (a piece of JSX)
import Header from './Header'
import Footer from './Footer'
// import MainPage from "../pages/MainPage";
// import BasketPage from "../pages/BasketPage";
// import ContactPage from "../pages/ContactPage";
// import NotFoundPage from "../pages/NotFoundPage";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='app'>

        <Header />

        {/* the routes, around the part of the JSX that will be modified based on the URL - the Routes component will not be rendered in the HTML, it's just to contain the routes */}
        <Routes>
          {/* <Route path="/" element={<MainPage />} />
          <Route path="/panier" element={<BasketPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/404" element={<NotFoundPage />} /> */}
        </Routes>

        <main>
          <section className="zzbanner">
          </section>
          <section>
            <h1>the z0mbie z0ne</h1>
            <h2>Liste des activités</h2>
            <div className="card"></div>
            <p className="warning">
              Vous avez déjà des ennuis. Désormais, il faut survivre.
            </p>
          </section>
          <section>
            <div className="card">
              <button onClick={() => setCount((count) => count + 1)} type="button">
                count is {count}
              </button>
              <p>
                Edit <code>src/App.tsx</code> and save to test HMR
              </p>
            </div>
          </section>
        </main>
        
        <Footer />

      </div>
    </>
  )
}

export default App
