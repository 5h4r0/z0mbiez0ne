import { useCallback, useState } from 'react';

export function useToast() {
  const [message, setMessage] = useState('');

  const toast = useCallback((msg: string, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  }, []);

  return { message, toast };
}
