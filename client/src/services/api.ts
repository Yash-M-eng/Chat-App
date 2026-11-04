import { PAGE_SIZE } from '@/shared/utils/constants';
import type { Conversation, Message, MessagesPage, User } from '@/types/chat';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong');
  }

  return data as T;
}

interface SendMessageBody {
  text: string;
  replyToId?: string | null;
  clientId?: string;
  senderId?: string;
}

export const chatApi = {
  getMe: () => request<User>('/me'),

  getUsers: () => request<User[]>('/users'),

  getConversations: () => request<Conversation[]>('/conversations'),

  markAsRead: (conversationId: string) =>
    request<Conversation>(`/conversations/${conversationId}/read`, { method: 'POST' }),

  getMessages: (conversationId: string, beforeId?: string) => {
    let url = `/conversations/${conversationId}/messages?limit=${PAGE_SIZE}`;
    if (beforeId) url += `&before=${beforeId}`;
    return request<MessagesPage>(url);
  },

  sendMessage: (conversationId: string, body: SendMessageBody) =>
    request<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  editMessage: (messageId: string, text: string) =>
    request<Message>(`/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ text }),
    }),

  deleteMessage: (messageId: string) => request<Message>(`/messages/${messageId}`, { method: 'DELETE' }),

  toggleReaction: (messageId: string, emoji: string) =>
    request<Message>(`/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),

  addMember: (conversationId: string, userId: string) =>
    request<Conversation>(`/conversations/${conversationId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  removeMember: (conversationId: string, userId: string) =>
    request<Conversation>(`/conversations/${conversationId}/members/${userId}`, {
      method: 'DELETE',
    }),
};
