import { MessageSquare } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { fetchConversations } from '../conversationsSlice';
import { selectFilteredConversations } from '../selectors';
import { useOpenConversation } from '../hooks/useOpenConversation';
import ConversationItem from './ConversationItem';

function ConversationSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 px-4 py-3">
      <div className="h-11 w-11 rounded-full bg-hover" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/2 rounded bg-hover" />
        <div className="h-3 w-3/4 rounded bg-hover" />
      </div>
    </div>
  );
}

export function ConversationList() {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector(selectFilteredConversations);
  const { loading, error, selectedId, search, filter } = useAppSelector((state) => state.conversations);
  const openConversation = useOpenConversation();

  if (loading && conversations.length === 0) {
    return (
      <div>
        {Array.from({ length: 6 }).map((_, i) => (
          <ConversationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => dispatch(fetchConversations())} />;
  }

  if (conversations.length === 0) {
    let title = 'No conversations yet';
    if (search) title = `No chats match "${search}"`;
    else if (filter === 'unread') title = 'You are all caught up';
    else if (filter === 'groups') title = 'No groups yet';

    return <EmptyState icon={MessageSquare} title={title} />;
  }

  return (
    <ul className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={conversation.id === selectedId}
          onSelect={openConversation}
        />
      ))}
    </ul>
  );
}
