import { useEffect } from 'react';
import { useAppDispatch } from './hooks';
import { fetchUsers } from '@/features/users/usersSlice';
import { fetchConversations } from '@/features/conversations/conversationsSlice';

export function useInitialData() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchConversations());
  }, [dispatch]);
}
