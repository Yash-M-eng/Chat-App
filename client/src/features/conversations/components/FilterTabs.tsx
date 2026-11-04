import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { ConversationFilter } from '@/types/chat';
import { setFilter } from '../conversationsSlice';
import { selectUnreadChatsCount } from '../selectors';

const tabs: { value: ConversationFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'groups', label: 'Groups' },
];

export function FilterTabs() {
  const dispatch = useAppDispatch();
  const activeFilter = useAppSelector((state) => state.conversations.filter);
  const unreadCount = useAppSelector(selectUnreadChatsCount);

  return (
    <div className="flex gap-2" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={activeFilter === tab.value}
          onClick={() => dispatch(setFilter(tab.value))}
          className={clsx(
            'rounded-full px-3 py-1 text-sm transition-colors',
            activeFilter === tab.value ? 'bg-forest text-cream dark:bg-accent dark:text-white' : 'bg-hover text-muted hover:text-main'
          )}
        >
          {tab.label}
          {tab.value === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
        </button>
      ))}
    </div>
  );
}
