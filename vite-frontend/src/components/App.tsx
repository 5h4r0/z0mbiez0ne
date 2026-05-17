import { Route, Routes } from 'react-router';
import ActivitiesPage from '../pages/ActivitiesPage';
import BasketPage from '../pages/BasketPage';
import CategoriesPage from '../pages/CategoriesPage';
import CguPage from '../pages/CguPage';
import ConfidentialitePage from '../pages/ConfidentialitePage';
import ContactPage from '../pages/ContactPage';
import DynamicDetailPage from '../pages/DynamicDetailPage';
import FaqPage from '../pages/FaqPage';
import HomePage from '../pages/HomePage';
import MentionsLegalesPage from '../pages/MentionsLegalesPage';
import NotFoundPage from '../pages/NotFoundPage';
import PlanPage from '../pages/PlanPage';
import SessionsPage from '../pages/SessionsPage';
import TarifsPage from '../pages/TarifsPage';
import Footer from './Footer';
import Header from './Header';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/les-epreuves" element={<ActivitiesPage />} />
        <Route path="/categories-epreuves" element={<CategoriesPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/tarifs" element={<TarifsPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
        <Route path="/cgu" element={<CguPage />} />
        <Route path="/confidentialite" element={<ConfidentialitePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/panier" element={<BasketPage />} />
        {/* Détail dynamique : session (slug-id), activité ou catégorie */}
        <Route path="/:slug" element={<DynamicDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
