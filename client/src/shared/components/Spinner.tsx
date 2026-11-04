import { Loader2 } from 'lucide-react';

export function Spinner() {
  return (
    <div className="flex flex-1 items-center justify-center p-6" role="status" aria-label="Loading">
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
    </div>
  );
}
