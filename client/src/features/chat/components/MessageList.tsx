import { Fragment, useEffect, useRef, useState } from 'react';
import { ArrowDown, MessageCircle, SearchX } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { getUserName } from '@/features/conversations/utils';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Spinner } from '@/shared/components/Spinner';
import { CURRENT_USER_ID } from '@/shared/utils/constants';
import { formatDateLabel } from '@/shared/utils/date';
import type { Conversation } from '@/types/chat';
import { fetchMessages, fetchOlderMessages } from '../messagesSlice';
import MessageBubble from './MessageBubble';
import { DateDivider } from './DateDivider';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  conversation: Conversation;
  searchText: string;
}

export function MessageList({ conversation, searchText }: MessageListProps) {
  const dispatch = useAppDispatch();
  const entry = useAppSelector((state) => state.messages.byConversation[conversation.id]);
  const usersById = useAppSelector((state) => state.users.byId);
  const typingUserIds = useAppSelector((state) => state.conversations.typing[conversation.id]);

  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstScroll = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const messages = entry?.items ?? [];
  const lastMessage = messages[messages.length - 1];
  const isTyping = !!typingUserIds && typingUserIds.length > 0;
  const isGroup = conversation.type === 'group';

  function scrollToBottom(smooth = true) {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }

  function handleScroll() {
    const container = containerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const atBottom = distanceFromBottom < 80;
    setIsAtBottom(atBottom);
    if (atBottom) setHasNewMessages(false);
  }

  useEffect(() => {
    if (!lastMessage || searchText) return;

    if (isFirstScroll.current) {
      isFirstScroll.current = false;
      scrollToBottom(false);
      return;
    }

    if (isAtBottom || lastMessage.senderId === CURRENT_USER_ID) {
      scrollToBottom();
    } else {
      setHasNewMessages(true);
    }
  }, [lastMessage?.id]);

  useEffect(() => {
    if (isTyping && isAtBottom) scrollToBottom();
  }, [isTyping]);

  if (!entry || (entry.loading && !entry.loaded)) {
    return <Spinner />;
  }

  if (entry.error && !entry.loaded) {
    return (
      <div className="flex-1">
        <ErrorState message={entry.error} onRetry={() => dispatch(fetchMessages(conversation.id))} />
      </div>
    );
  }

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1">
        <EmptyState icon={MessageCircle} title="No messages yet" description="Say hello to start the conversation" />
      </div>
    );
  }

  const query = searchText.toLowerCase();
  const visibleMessages = query
    ? messages.filter((m) => !m.deleted && m.text.toLowerCase().includes(query))
    : messages;

  let previousDate = '';

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={containerRef} onScroll={handleScroll} className="flex flex-1 flex-col overflow-y-auto py-3">
        <div className="mt-auto">
          {entry.hasMore && !query && (
            <div className="flex justify-center py-2">
              <button
                onClick={() => dispatch(fetchOlderMessages(conversation.id))}
                disabled={entry.loadingOlder}
                className="rounded-full bg-panel px-4 py-1.5 text-xs text-muted shadow-sm hover:text-main disabled:opacity-60"
              >
                {entry.loadingOlder ? 'Loading...' : 'Load older messages'}
              </button>
            </div>
          )}

          {query && (
            <p className="px-4 pb-2 text-center text-xs text-muted">
              {visibleMessages.length} {visibleMessages.length === 1 ? 'result' : 'results'} in loaded messages
            </p>
          )}

          {query && visibleMessages.length === 0 && (
            <EmptyState icon={SearchX} title="No messages found" description="Try another word or load older messages" />
          )}

          {visibleMessages.map((message, index) => {
            const dateLabel = formatDateLabel(message.createdAt);
            const showDate = dateLabel !== previousDate;
            previousDate = dateLabel;

            const isOwn = message.senderId === CURRENT_USER_ID;
            const repliedMessage = message.replyToId ? messages.find((m) => m.id === message.replyToId) : undefined;

            return (
              <Fragment key={message.id}>
                {showDate && <DateDivider label={dateLabel} />}
                <MessageBubble
                  message={message}
                  isOwn={isOwn}
                  senderName={isGroup && !isOwn ? getUserName(message.senderId, usersById) : undefined}
                  repliedMessage={repliedMessage}
                  repliedSenderName={repliedMessage ? getUserName(repliedMessage.senderId, usersById) : undefined}
                  openMenuUpwards={index >= visibleMessages.length - 3}
                />
              </Fragment>
            );
          })}

          {isTyping && !query && (
            <TypingIndicator name={isGroup ? getUserName(typingUserIds[0], usersById) : undefined} />
          )}
        </div>
      </div>

      {!isAtBottom && (
        <button
          onClick={() => scrollToBottom()}
          aria-label="Scroll to latest message"
          className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-deep px-3 py-2 text-xs text-cream shadow-lg"
        >
          <ArrowDown size={14} />
          {hasNewMessages && 'New messages'}
        </button>
      )}
    </div>
  );
}
