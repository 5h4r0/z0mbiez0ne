import useStore from '../store/store'

export default function Footer() {

  // the isDark state is in the zustand store, we get its value and its setter
  const isDark = useStore((state) => state.isDark);
  const toogleTheme = useStore((state) => state.toogleTheme);

  return (
    <>
      <footer>
        <button type="button" className="darkBtn" onClick={toogleTheme}>
          {isDark ? "☀️" : "🌙"}
        </button>
      </footer>
    </>
  )
}