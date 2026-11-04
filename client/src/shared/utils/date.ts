import { format, formatDistanceToNow, isThisWeek, isToday, isYesterday } from 'date-fns';

export function formatConversationTime(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  return format(date, 'dd/MM/yy');
}

export function formatMessageTime(iso: string) {
  return format(new Date(iso), 'HH:mm');
}

export function formatDateLabel(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'd MMMM yyyy');
}

export function formatLastSeen(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}
