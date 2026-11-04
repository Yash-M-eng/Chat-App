export function TypingIndicator({ name }: { name?: string }) {
  return (
    <div className="flex px-4 py-1" aria-label="Someone is typing">
      <div className="rounded-2xl rounded-bl-sm bg-bubble-in px-3 py-2 shadow-sm">
        {name && <p className="mb-1 text-xs font-semibold text-accent">{name}</p>}
        <div className="flex gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-2 w-2 animate-bounce rounded-full bg-muted"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
