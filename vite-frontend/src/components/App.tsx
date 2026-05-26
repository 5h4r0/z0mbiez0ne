// vite-frontend/src/components/App.tsx
import { useEffect } from 'react';
import { Outlet, Route, Routes } from 'react-router';
import ActivitiesPage from '../pages/ActivitiesPage';
import BasketPage from '../pages/BasketPage';
import CategoriesPage from '../pages/CategoriesPage';
import CguPage from '../pages/CguPage';
import ConfidentialitePage from '../pages/ConfidentialitePage';
import ContactPage from '../pages/ContactPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import LoginPage from '../pages/LoginPage';
import OrderDetailPage from '../pages/dashboard/OrderDetailPage';
import DynamicDetailPage from '../pages/DynamicDetailPage';
import FaqPage from '../pages/FaqPage';
import HomePage from '../pages/HomePage';
import ManageActivitiesPage from '../pages/manage/ManageActivitiesPage';
import ManageActivityFormPage from '../pages/manage/ManageActivityFormPage';
import ManageCategoriesPage from '../pages/manage/ManageCategoriesPage';
import ManageCategoryFormPage from '../pages/manage/ManageCategoryFormPage';
import ManageHubPage from '../pages/manage/ManageHubPage';
import ManageLoginPage from '../pages/manage/ManageLoginPage';
import ManageOrdersPage from '../pages/manage/ManageOrdersPage';
import ManageSessionFormPage from '../pages/manage/ManageSessionFormPage';
import ManageSessionsPage from '../pages/manage/ManageSessionsPage';
import ManageUsersPage from '../pages/manage/ManageUsersPage';
import MentionsLegalesPage from '../pages/MentionsLegalesPage';
import NotFoundPage from '../pages/NotFoundPage';
import PlanPage from '../pages/PlanPage';
import SessionDetailPage from '../pages/SessionDetailPage';
import SessionsPage from '../pages/SessionsPage';
import TarifsPage from '../pages/TarifsPage';
import { useAuthStore } from '../store/authStore';
import '../styles/App.css';
import Footer from './Footer';
import Header from './Header';
import AdminGuard from './manage/AdminGuard';
import ManageLayout from './manage/ManageLayout';
import ScrollToTop from './ScrollToTop';

// Layout avec Header/Footer pour le site public + espace client
function PublicLayout() {
  return (
    <div className="app">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  useEffect(() => {
    useAuthStore.getState().refreshToken().catch(() => {});
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Routes /manage — sans Header/Footer public */}
        <Route path="/manage/login" element={<ManageLoginPage />} />
        <Route path="/manage" element={<AdminGuard />}>
          <Route element={<ManageLayout />}>
            <Route index element={<ManageHubPage />} />
            <Route path="activities" element={<ManageActivitiesPage />} />
            <Route path="activites" element={<ManageActivitiesPage />} />
            <Route path="activites/nouvelle" element={<ManageActivityFormPage />} />
            <Route path="activites/:id" element={<ManageActivityFormPage />} />
            <Route path="categories" element={<ManageCategoriesPage />} />
            <Route path="categories/nouvelle" element={<ManageCategoryFormPage />} />
            <Route path="categories/:id" element={<ManageCategoryFormPage />} />
            <Route path="sessions" element={<ManageSessionsPage />} />
            <Route path="sessions/nouvelle" element={<ManageSessionFormPage />} />
            <Route path="sessions/:id" element={<ManageSessionFormPage />} />
            <Route path="orders" element={<ManageOrdersPage />} />
            <Route path="commandes" element={<ManageOrdersPage />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="utilisateurs" element={<ManageUsersPage />} />
          </Route>
        </Route>

        {/* Routes publiques + espace client — avec Header/Footer */}
        <Route element={<PublicLayout />}>
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/commandes/:id" element={<OrderDetailPage />} />
          <Route path="/sessions/:id" element={<SessionDetailPage />} />
          {/* Détail dynamique : session (slug-id), activité ou catégorie */}
          <Route path="/:slug" element={<DynamicDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
