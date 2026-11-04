import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <AlertCircle className="h-10 w-10 text-brand" />
      <p className="text-sm text-muted">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-accent"
        >
          Try again
        </button>
      )}
    </div>
  );
}
