import './App.css'
// importing the React Router components used to define our routes
import { Route, Routes } from 'react-router'

// import of sub-components that are defined in other files and that correspond to a piece of the interface (a piece of JSX)
import Header from './Header';
import Footer from './Footer';
import MainPage from "../pages/MainPage";
import AllActivities from './AllActivities';
import AllSessions from './AllSessions';

// import BasketPage from "../pages/BasketPage";
// import ContactPage from "../pages/ContactPage";
// import NotFoundPage from "../pages/NotFoundPage";

function App() {
  return (
    <>
      <div className='app'>
        <Header />

        {/* the routes, around the part of the JSX that will be modified based on the URL - the Routes component will not be rendered in the HTML, it's just to contain the routes */}
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/activities" element={<AllActivities />} />
          <Route path="/Sessions" element={<AllSessions />} />
          {/*
          <Route path="/panier" element={<BasketPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          */}
        </Routes>
        
        <Footer />
      </div>
    </>
  )
}

export default App
