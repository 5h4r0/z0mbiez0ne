
// import of sub-components that are defined in other files and that correspond to a piece of the interface (a piece of JSX)
import Header from './Header';
import MainPage from "../pages/MainPage";
import Footer from './Footer';

function App() {
  return (
    <>
      <Header />
      <MainPage />
      <Footer />
    </>
  )
}

export default App