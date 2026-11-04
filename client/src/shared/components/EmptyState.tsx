import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      {Icon && <Icon className="h-10 w-10 text-muted opacity-60" />}
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
    </div>
  );
}
