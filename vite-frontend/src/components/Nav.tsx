import { NavLink } from "react-router";

export default function Nav() {
  return (
    <>
      <nav>
        <NavLink to="/">Accueil</NavLink>
        <NavLink to="/activities">Activités</NavLink>
        <NavLink to="/sessions">Sessions à venir</NavLink>
        <NavLink to="/categories">Catégories</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        <NavLink to="/account">Client</NavLink>
      </nav>
    </>
  )
}