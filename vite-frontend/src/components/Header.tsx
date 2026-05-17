// import zzLogo from '../assets/logo-zombie-zone-256.png'
import Nav from './Nav'
import useStore from '../store/store'

export default function Header() {
  const isDark = useStore((state) => state.isDark);
  const toogleTheme = useStore((state) => state.toogleTheme);

  return (
    <>
      <header>
        <a href="/">
          {/* <img src={zzLogo} className="logo" alt="the z0mbie z0ne logo" /> */}
        </a>
        <div>the z0mbie z0ne</div>

      <button type="button" className="darkBtn" onClick={toogleTheme}>
        {isDark ? "☀️" : "🌙"}
      </button>

        <Nav />

      </header>
    </>
  )
}