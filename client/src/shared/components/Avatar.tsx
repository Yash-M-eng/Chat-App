import { useState } from 'react';
import clsx from 'clsx';
import type { PresenceStatus } from '@/types/chat';

interface AvatarProps {
  src?: string;
  name: string;
  status?: PresenceStatus;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-20 w-20 text-xl',
};

const statusClasses: Record<PresenceStatus, string> = {
  online: 'bg-green-500',
  away: 'bg-yellow-400',
  offline: 'bg-gray-400',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ src, name, status, size = 'md' }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const showImage = src && !hasError;

  return (
    <div className={clsx('relative shrink-0', sizeClasses[size])}>
      {showImage ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setHasError(true)}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-accent font-semibold text-white">
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          title={status}
          className={clsx(
            'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-panel',
            statusClasses[status]
          )}
        />
      )}
    </div>
  );
}
