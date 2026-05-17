// the "create" function creates the store.
// It is passed as parameters the content of the state and the state modification functions, which are like mini-reducers that take the current state as a parameter and return the future state.

import { create } from 'zustand';

// type du store
interface IThemeStore {
  isDark: boolean;
  toogleTheme: () => void;
}

const useStore = create<IThemeStore>()((set) => ({
  // We place the state and the direct modification functions here
  isDark: false,
  toogleTheme: () =>
    set((state) => ({
      isDark: !state.isDark,
    })),
}));

export default useStore;
