import { NavLink } from 'react-router';

export default function Nav() {
  return (
    <nav className="header__nav">
      <NavLink className={({ isActive }) => `menu-link${isActive ? ' menu-link--selected' : ''}`} to="/">
        Accueil
      </NavLink>
      <NavLink className={({ isActive }) => `menu-link${isActive ? ' menu-link--selected' : ''}`} to="/sessions">
        Sessions à venir
      </NavLink>
      <NavLink className={({ isActive }) => `menu-link${isActive ? ' menu-link--selected' : ''}`} to="/activities">
        Activités
      </NavLink>
      <NavLink className={({ isActive }) => `menu-link${isActive ? ' menu-link--selected' : ''}`} to="/categories">
        Catégories
      </NavLink>
      <NavLink className={({ isActive }) => `menu-link${isActive ? ' menu-link--selected' : ''}`} to="/contact">
        Contact
      </NavLink>
    </nav>
  );
}
