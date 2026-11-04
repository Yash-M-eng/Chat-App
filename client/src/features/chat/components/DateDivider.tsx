export function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-2">
      <span className="rounded-full bg-panel px-3 py-1 text-xs text-muted shadow-sm">{label}</span>
    </div>
  );
}
