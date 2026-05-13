import zzLogo from '../assets/logo-zombie-zone-256.png'
import Nav from './Nav'

export default function Header() {

  return (
    <>
      <header>
        <a href="/" className="zzlink" target="_blank" rel="noopener">
          <img src={zzLogo} className="logo" alt="the z0mbie z0ne logo" />
        </a>

        <Nav />
      </header>
      <h1>the z0mbie z0ne</h1>
    </>
  )
}