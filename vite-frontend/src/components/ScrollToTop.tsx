import { useEffect } from 'react';
import { useLocation } from 'react-router';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}