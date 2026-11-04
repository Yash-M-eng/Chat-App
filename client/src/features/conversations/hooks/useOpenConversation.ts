import { useCallback } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { fetchMessages } from '@/features/chat/messagesSlice';
import { markConversationRead, selectConversation } from '../conversationsSlice';

export function useOpenConversation() {
  const dispatch = useAppDispatch();

  return useCallback(
    (conversationId: string) => {
      dispatch(selectConversation(conversationId));
      dispatch(fetchMessages(conversationId));
      dispatch(markConversationRead(conversationId));
    },
    [dispatch]
  );
}
