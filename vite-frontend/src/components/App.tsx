import './App.css'
import { Route, Routes } from 'react-router'

import Header from './Header';
import Footer from './Footer';
import MainPage from '../pages/MainPage';
import AllActivities from './AllActivities';
import AllSessions from './AllSessions';
import CategoriesPage from '../pages/CategoriesPage';
import ContactPage from '../pages/ContactPage';
import NotFoundPage from '../pages/NotFoundPage';

function App() {
  return (
    <>
      <div className='app'>
        <Header />

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/activities" element={<AllActivities />} />
          <Route path="/sessions" element={<AllSessions />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <Footer />
      </div>
    </>
  )
}

export default App
