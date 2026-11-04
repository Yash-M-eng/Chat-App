import { useEffect, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Check, Pencil, Reply, SendHorizontal, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { getUserName } from '@/features/conversations/utils';
import { editMessage, setEditing, setReplyTo } from '../messagesSlice';
import { sendChatMessage } from '../chatThunks';

interface MessageInputProps {
  conversationId: string;
}

interface FormValues {
  text: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const dispatch = useAppDispatch();
  const replyTo = useAppSelector((state) => state.messages.replyTo);
  const editing = useAppSelector((state) => state.messages.editing);
  const usersById = useAppSelector((state) => state.users.byId);

  const { register, handleSubmit, reset, setFocus, watch } = useForm<FormValues>({
    defaultValues: { text: '' },
  });
  const text = watch('text');

  useEffect(() => {
    if (editing) {
      reset({ text: editing.text });
      setFocus('text');
    }
  }, [editing, reset, setFocus]);

  useEffect(() => {
    if (replyTo) setFocus('text');
  }, [replyTo, setFocus]);

  useEffect(() => {
    return () => {
      dispatch(setReplyTo(null));
      dispatch(setEditing(null));
    };
  }, [dispatch]);

  function onSubmit(values: FormValues) {
    const value = values.text.trim();
    if (!value) return;

    if (editing) {
      if (value !== editing.text) {
        dispatch(editMessage({ messageId: editing.id, text: value }));
      } else {
        dispatch(setEditing(null));
      }
    } else {
      dispatch(sendChatMessage({ conversationId, text: value, replyToId: replyTo?.id ?? null }));
    }

    reset({ text: '' });
  }

  function cancel() {
    if (editing) {
      dispatch(setEditing(null));
      reset({ text: '' });
    }
    if (replyTo) dispatch(setReplyTo(null));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
    if (event.key === 'Escape') {
      cancel();
    }
  }

  const banner = editing ?? replyTo;

  return (
    <div className="border-t border-line bg-panel px-3 py-2">
      {banner && (
        <div className="mb-2 flex items-start gap-2 rounded-lg border-l-4 border-accent bg-hover px-3 py-2 text-sm">
          {editing ? <Pencil size={16} className="mt-0.5 text-accent" /> : <Reply size={16} className="mt-0.5 text-accent" />}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-accent">
              {editing ? 'Editing message' : `Replying to ${getUserName(banner.senderId, usersById)}`}
            </p>
            <p className="truncate text-muted">{banner.text}</p>
          </div>
          <button onClick={cancel} aria-label="Cancel" className="text-muted hover:text-main">
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2">
        <textarea
          {...register('text')}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message"
          aria-label="Message"
          className="field-sizing-content max-h-32 min-h-10 flex-1 resize-none rounded-2xl border border-line bg-field px-4 py-2 text-sm outline-none placeholder:text-muted focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={!text?.trim()}
          aria-label={editing ? 'Save message' : 'Send message'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white hover:bg-accent disabled:opacity-40"
        >
          {editing ? <Check size={18} /> : <SendHorizontal size={18} />}
        </button>
      </form>

      <p className="mt-1 hidden text-[11px] text-muted md:block">
        Enter to send, Shift + Enter for a new line, Esc to cancel reply or edit
      </p>
    </div>
  );
}
