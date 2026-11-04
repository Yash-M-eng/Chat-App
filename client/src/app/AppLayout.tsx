import clsx from 'clsx';
import { MessagesSquare } from 'lucide-react';
import { useAppSelector } from './hooks';
import { Sidebar } from '@/features/conversations/components/Sidebar';
import { selectSelectedConversation } from '@/features/conversations/selectors';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import { EmptyState } from '@/shared/components/EmptyState';

export function AppLayout() {
  const selectedConversation = useAppSelector(selectSelectedConversation);
  const hasSelection = selectedConversation !== null;

  return (
    <div className="flex h-dvh overflow-hidden bg-app text-main">
      <aside
        className={clsx(
          'w-full flex-col border-r border-line bg-panel md:flex md:w-80 lg:w-96',
          hasSelection ? 'hidden' : 'flex'
        )}
      >
        <Sidebar />
      </aside>

      <main className={clsx('min-w-0 flex-1 md:flex', hasSelection ? 'flex' : 'hidden')}>
        {selectedConversation ? (
          <ChatWindow key={selectedConversation.id} conversation={selectedConversation} />
        ) : (
          <EmptyState
            icon={MessagesSquare}
            title="Select a conversation"
            description="Pick a chat from the list to start messaging"
          />
        )}
      </main>
    </div>
  );
}
