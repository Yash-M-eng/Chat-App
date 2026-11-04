import { CURRENT_USER_ID } from '@/shared/utils/constants';
import type { Conversation, User } from '@/types/chat';

export function getOtherUser(conversation: Conversation, usersById: Record<string, User>) {
  const otherId = conversation.memberIds.find((id) => id !== CURRENT_USER_ID);
  return otherId ? usersById[otherId] : undefined;
}

export function getConversationName(conversation: Conversation, usersById: Record<string, User>) {
  if (conversation.type === 'group') return conversation.name ?? 'Unnamed group';
  return getOtherUser(conversation, usersById)?.name ?? 'Unknown user';
}

export function getConversationAvatar(conversation: Conversation, usersById: Record<string, User>) {
  if (conversation.type === 'group') return conversation.avatar ?? '';
  return getOtherUser(conversation, usersById)?.avatar ?? '';
}

export function getUserName(userId: string, usersById: Record<string, User>) {
  if (userId === CURRENT_USER_ID) return 'You';
  return usersById[userId]?.name ?? 'Unknown user';
}

export function getLastMessagePreview(conversation: Conversation, usersById: Record<string, User>) {
  const message = conversation.lastMessage;
  if (!message) return 'No messages yet';
  if (message.deleted) return 'This message was deleted';

  let prefix = '';
  if (message.senderId === CURRENT_USER_ID) {
    prefix = 'You: ';
  } else if (conversation.type === 'group') {
    const firstName = usersById[message.senderId]?.name.split(' ')[0];
    if (firstName) prefix = `${firstName}: `;
  }
  return prefix + message.text;
}
