import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { GroupInfoPanel } from '@/features/groups/components/GroupInfoPanel';
import type { Conversation } from '@/types/chat';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  conversation: Conversation;
}

export function ChatWindow({ conversation }: ChatWindowProps) {
  const isGroupInfoOpen = useAppSelector((state) => state.ui.isGroupInfoOpen);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  function closeSearch() {
    setIsSearchOpen(false);
    setSearchText('');
  }

  function toggleSearch() {
    if (isSearchOpen) closeSearch();
    else setIsSearchOpen(true);
  }

  return (
    <div className="flex min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader conversation={conversation} onSearchClick={toggleSearch} />

        {isSearchOpen && (
          <div className="flex items-center gap-2 border-b border-line bg-panel px-4 py-2">
            <Search size={16} className="text-muted" />
            <input
              autoFocus
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
              placeholder="Search in this chat"
              aria-label="Search messages"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
            <button onClick={closeSearch} aria-label="Close search" className="text-muted hover:text-main">
              <X size={16} />
            </button>
          </div>
        )}

        <MessageList conversation={conversation} searchText={searchText.trim()} />
        <MessageInput conversationId={conversation.id} />
      </div>

      {isGroupInfoOpen && conversation.type === 'group' && <GroupInfoPanel conversation={conversation} />}
    </div>
  );
}
