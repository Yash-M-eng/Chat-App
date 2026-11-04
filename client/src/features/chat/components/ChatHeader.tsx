import clsx from 'clsx';
import { ArrowLeft, Info, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setGroupInfoOpen } from '@/app/uiSlice';
import { selectConversation } from '@/features/conversations/conversationsSlice';
import { getConversationAvatar, getConversationName, getOtherUser } from '@/features/conversations/utils';
import { Avatar } from '@/shared/components/Avatar';
import { formatLastSeen } from '@/shared/utils/date';
import type { Conversation } from '@/types/chat';

interface ChatHeaderProps {
  conversation: Conversation;
  onSearchClick: () => void;
}

export function ChatHeader({ conversation, onSearchClick }: ChatHeaderProps) {
  const dispatch = useAppDispatch();
  const usersById = useAppSelector((state) => state.users.byId);
  const typingUserIds = useAppSelector((state) => state.conversations.typing[conversation.id]);
  const isGroupInfoOpen = useAppSelector((state) => state.ui.isGroupInfoOpen);

  const isGroup = conversation.type === 'group';
  const otherUser = isGroup ? undefined : getOtherUser(conversation, usersById);
  const name = getConversationName(conversation, usersById);
  const avatar = getConversationAvatar(conversation, usersById);
  const isTyping = !!typingUserIds && typingUserIds.length > 0;

  function getSubtitle() {
    if (isTyping) {
      if (!isGroup) return 'typing...';
      const firstName = usersById[typingUserIds[0]]?.name.split(' ')[0] ?? 'Someone';
      return `${firstName} is typing...`;
    }
    if (isGroup) {
      const onlineCount = conversation.memberIds.filter((id) => usersById[id]?.status === 'online').length;
      return `${conversation.memberIds.length} members, ${onlineCount} online`;
    }
    if (!otherUser) return '';
    if (otherUser.status === 'online') return 'online';
    if (otherUser.lastSeen) return `last seen ${formatLastSeen(otherUser.lastSeen)}`;
    return otherUser.status;
  }

  function toggleGroupInfo() {
    dispatch(setGroupInfoOpen(!isGroupInfoOpen));
  }

  return (
    <header className="flex items-center gap-2 bg-deep px-3 py-2.5 text-cream">
      <button
        onClick={() => dispatch(selectConversation(null))}
        aria-label="Back to chats"
        className="rounded-full p-1.5 hover:bg-white/10 md:hidden"
      >
        <ArrowLeft size={20} />
      </button>

      <button
        onClick={toggleGroupInfo}
        disabled={!isGroup}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <Avatar src={avatar} name={name} status={otherUser?.status} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{name}</p>
          <p className={clsx('truncate text-xs', isTyping ? 'text-accent' : 'text-cream/70')}>{getSubtitle()}</p>
        </div>
      </button>

      <button onClick={onSearchClick} aria-label="Search messages" className="rounded-full p-2 hover:bg-white/10">
        <Search size={18} />
      </button>

      {isGroup && (
        <button onClick={toggleGroupInfo} aria-label="Group info" className="rounded-full p-2 hover:bg-white/10">
          <Info size={18} />
        </button>
      )}
    </header>
  );
}
