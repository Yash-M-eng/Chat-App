import { useEffect } from 'react';
import { useAppSelector } from '@/app/hooks';

export function useApplyTheme() {
  const theme = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
}
