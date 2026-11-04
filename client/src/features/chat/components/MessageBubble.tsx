import { memo, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AlertCircle, Check, CheckCheck, Clock, MoreVertical } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { CURRENT_USER_ID } from '@/shared/utils/constants';
import { formatMessageTime } from '@/shared/utils/date';
import type { Message, MessageStatus } from '@/types/chat';
import { deleteMessage, setEditing, setReplyTo, toggleReaction } from '../messagesSlice';
import { retryMessage } from '../chatThunks';
import { MessageMenu } from './MessageMenu';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
  repliedMessage?: Message;
  repliedSenderName?: string;
  openMenuUpwards?: boolean;
}

function StatusIcon({ status }: { status: MessageStatus }) {
  if (status === 'sending') return <Clock size={13} aria-label="Sending" />;
  if (status === 'sent') return <Check size={14} aria-label="Sent" />;
  if (status === 'delivered') return <CheckCheck size={14} aria-label="Delivered" />;
  if (status === 'read') return <CheckCheck size={14} className="text-accent" aria-label="Read" />;
  return <AlertCircle size={14} className="text-brand" aria-label="Failed" />;
}

function MessageBubble({
  message,
  isOwn,
  senderName,
  repliedMessage,
  repliedSenderName,
  openMenuUpwards = false,
}: MessageBubbleProps) {
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useClickOutside(wrapperRef, () => setIsMenuOpen(false), isMenuOpen);

  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [isCopied]);

  const isPending = message.status === 'sending' || message.status === 'failed';

  function handleReply() {
    dispatch(setReplyTo(message));
    setIsMenuOpen(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(message.text).then(() => setIsCopied(true));
    setIsMenuOpen(false);
  }

  function handleEdit() {
    dispatch(setEditing(message));
    setIsMenuOpen(false);
  }

  function handleDelete() {
    setIsMenuOpen(false);
    if (window.confirm('Delete this message?')) {
      dispatch(deleteMessage(message.id));
    }
  }

  function handleReact(emoji: string) {
    dispatch(toggleReaction({ messageId: message.id, emoji }));
    setIsMenuOpen(false);
  }

  function goToRepliedMessage() {
    document
      .getElementById(`message-${message.replyToId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (message.deleted) {
    return (
      <div id={`message-${message.id}`} className={clsx('flex px-4 py-0.5', isOwn ? 'justify-end' : 'justify-start')}>
        <div className="rounded-2xl border border-line px-3 py-2 text-sm italic text-muted">
          This message was deleted
          <span className="ml-2 text-[11px] not-italic">{formatMessageTime(message.createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div id={`message-${message.id}`} className={clsx('group flex px-4 py-0.5', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        ref={wrapperRef}
        className={clsx('relative flex max-w-[85%] items-start gap-1 md:max-w-[65%]', isOwn && 'flex-row-reverse')}
      >
        <div className="min-w-0">
          <div
            className={clsx(
              'rounded-2xl px-3 py-2 shadow-sm',
              isOwn ? 'rounded-br-sm bg-bubble-out text-cream' : 'rounded-bl-sm bg-bubble-in'
            )}
          >
            {senderName && <p className="mb-0.5 text-xs font-semibold text-accent">{senderName}</p>}

            {message.replyToId && (
              <button
                onClick={goToRepliedMessage}
                className="mb-1 block w-full rounded-lg border-l-4 border-accent bg-black/10 px-2 py-1 text-left text-xs"
              >
                <span className="block font-semibold">{repliedSenderName ?? 'Message'}</span>
                <span className="line-clamp-2 opacity-80">
                  {!repliedMessage && 'Original message is not loaded'}
                  {repliedMessage?.deleted && 'This message was deleted'}
                  {repliedMessage && !repliedMessage.deleted && repliedMessage.text}
                </span>
              </button>
            )}

            <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>

            <div className="mt-1 flex items-center justify-end gap-1 text-[11px] opacity-70">
              {isCopied && <span>Copied</span>}
              {message.editedAt && <span>edited</span>}
              <span>{formatMessageTime(message.createdAt)}</span>
              {isOwn && <StatusIcon status={message.status} />}
            </div>
          </div>

          {message.status === 'failed' && (
            <button onClick={() => dispatch(retryMessage(message))} className="mt-1 text-xs text-brand hover:underline">
              Not sent. Tap to retry
            </button>
          )}

          {message.reactions.length > 0 && (
            <div className={clsx('mt-1 flex flex-wrap gap-1', isOwn && 'justify-end')}>
              {message.reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  onClick={() => handleReact(reaction.emoji)}
                  className={clsx(
                    'rounded-full border px-2 py-0.5 text-xs',
                    reaction.userIds.includes(CURRENT_USER_ID) ? 'border-accent bg-accent/15' : 'border-line bg-panel'
                  )}
                >
                  {reaction.emoji} {reaction.userIds.length}
                </button>
              ))}
            </div>
          )}
        </div>

        {!isPending && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Message options"
            aria-expanded={isMenuOpen}
            className={clsx(
              'mt-1 shrink-0 rounded-full p-1 text-muted hover:bg-hover',
              isMenuOpen ? 'opacity-100' : 'md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100'
            )}
          >
            <MoreVertical size={16} />
          </button>
        )}

        {isMenuOpen && (
          <MessageMenu
            isOwn={isOwn}
            openUpwards={openMenuUpwards}
            onReply={handleReply}
            onCopy={handleCopy}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReact={handleReact}
          />
        )}
      </div>
    </div>
  );
}

export default memo(MessageBubble);
