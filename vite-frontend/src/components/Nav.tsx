import { NavLink } from "react-router";

export default function Nav() {
  return (
    <>
      <nav className="header__nav">
        <NavLink className="menu-link menu-link--selected" to="/">Accueil</NavLink>
        <NavLink className="menu-link" to="/activites">Activités</NavLink>
        <NavLink className="menu-link" to="/categories">Catégories</NavLink>
        <NavLink className="menu-link" to="/evenements">Évènements</NavLink>
        <NavLink className="menu-link" to="/contact">Contact</NavLink>
        <NavLink className="menu-link" to="/compte">Client</NavLink>
      </nav>
    </>
  )
}