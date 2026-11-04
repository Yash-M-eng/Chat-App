import { memo } from 'react';
import clsx from 'clsx';
import { useAppSelector } from '@/app/hooks';
import { Avatar } from '@/shared/components/Avatar';
import { formatConversationTime } from '@/shared/utils/date';
import type { Conversation } from '@/types/chat';
import { getConversationAvatar, getConversationName, getLastMessagePreview, getOtherUser } from '../utils';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function ConversationItem({ conversation, isSelected, onSelect }: ConversationItemProps) {
  const usersById = useAppSelector((state) => state.users.byId);
  const typingUserIds = useAppSelector((state) => state.conversations.typing[conversation.id]);

  const name = getConversationName(conversation, usersById);
  const avatar = getConversationAvatar(conversation, usersById);
  const status = conversation.type === 'direct' ? getOtherUser(conversation, usersById)?.status : undefined;
  const isTyping = typingUserIds && typingUserIds.length > 0;
  const hasUnread = conversation.unreadCount > 0;

  return (
    <li>
      <button
        onClick={() => onSelect(conversation.id)}
        aria-current={isSelected}
        className={clsx(
          'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
          isSelected ? 'bg-hover' : 'hover:bg-hover/60'
        )}
      >
        <Avatar src={avatar} name={name} status={status} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-medium">{name}</span>
            {conversation.lastMessage && (
              <span className={clsx('shrink-0 text-xs', hasUnread ? 'font-semibold text-accent' : 'text-muted')}>
                {formatConversationTime(conversation.lastMessage.createdAt)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            {isTyping ? (
              <span className="truncate text-sm italic text-accent">typing...</span>
            ) : (
              <span
                className={clsx(
                  'truncate text-sm',
                  hasUnread ? 'font-medium text-main' : 'text-muted',
                  conversation.lastMessage?.deleted && 'italic'
                )}
              >
                {getLastMessagePreview(conversation, usersById)}
              </span>
            )}

            {hasUnread && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-white">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

export default memo(ConversationItem);
