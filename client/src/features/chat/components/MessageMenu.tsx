import clsx from 'clsx';
import { Copy, Pencil, Reply, Trash2, type LucideIcon } from 'lucide-react';
import { REACTION_EMOJIS } from '@/shared/utils/constants';

interface MessageMenuProps {
  isOwn: boolean;
  openUpwards: boolean;
  onReply: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReact: (emoji: string) => void;
}

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function MenuItem({ icon: Icon, label, onClick, danger }: MenuItemProps) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={clsx(
        'flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-hover',
        danger ? 'text-brand' : 'text-main'
      )}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

export function MessageMenu({ isOwn, openUpwards, onReply, onCopy, onEdit, onDelete, onReact }: MessageMenuProps) {
  return (
    <div
      role="menu"
      className={clsx(
        'absolute z-20 w-56 overflow-hidden rounded-xl border border-line bg-panel shadow-lg',
        isOwn ? 'right-0' : 'left-0',
        openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
      )}
    >
      <div className="flex justify-between border-b border-line px-2 py-1">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            aria-label={`React with ${emoji}`}
            className="rounded-md p-1 text-lg hover:bg-hover"
          >
            {emoji}
          </button>
        ))}
      </div>
      <MenuItem icon={Reply} label="Reply" onClick={onReply} />
      <MenuItem icon={Copy} label="Copy" onClick={onCopy} />
      {isOwn && <MenuItem icon={Pencil} label="Edit" onClick={onEdit} />}
      {isOwn && <MenuItem icon={Trash2} label="Delete" onClick={onDelete} danger />}
    </div>
  );
}
