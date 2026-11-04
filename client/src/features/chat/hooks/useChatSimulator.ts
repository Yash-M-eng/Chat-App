import { useEffect } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { simulateRandomActivity } from '../chatThunks';

export function useChatSimulator(interval = 20000) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setInterval(() => dispatch(simulateRandomActivity()), interval);
    return () => clearInterval(timer);
  }, [dispatch, interval]);
}
