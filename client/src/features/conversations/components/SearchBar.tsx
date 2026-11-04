import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { setSearch } from '../conversationsSlice';

export function SearchBar() {
  const dispatch = useAppDispatch();
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    dispatch(setSearch(debouncedValue));
  }, [debouncedValue, dispatch]);

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search conversations"
        aria-label="Search conversations"
        className="w-full rounded-lg border border-line bg-field py-2 pl-9 pr-8 text-sm outline-none placeholder:text-muted focus:ring-2 focus:ring-accent"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-main"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
