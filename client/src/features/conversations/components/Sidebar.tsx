import { useAppSelector } from '@/app/hooks';
import { Avatar } from '@/shared/components/Avatar';
import { ThemeToggle } from '@/features/theme/ThemeToggle';
import { SearchBar } from './SearchBar';
import { FilterTabs } from './FilterTabs';
import { ConversationList } from './ConversationList';

export function Sidebar() {
  const me = useAppSelector((state) => state.users.me);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between bg-deep px-4 py-3 text-cream">
        <div className="flex items-center gap-3">
          {me && <Avatar src={me.avatar} name={me.name} size="sm" />}
          <h1 className="text-lg font-semibold">Chats</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="space-y-3 border-b border-line p-4">
        <SearchBar />
        <FilterTabs />
      </div>

      <ConversationList />
    </div>
  );
}
