import type { RootState } from '@/app/store';
import type { Conversation, Message, User } from '@/types/chat';

export const users: Record<string, User> = {
  me: { id: 'me', name: 'Alex Carter', avatar: '', status: 'online' },
  u2: { id: 'u2', name: 'Priya Sharma', avatar: '', status: 'online' },
  u3: { id: 'u3', name: 'Rahul Verma', avatar: '', status: 'offline' },
};

export function createMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'm1',
    conversationId: 'c1',
    senderId: 'u2',
    text: 'Hello there',
    createdAt: '2026-11-03T10:00:00.000Z',
    status: 'read',
    reactions: [],
    ...overrides,
  };
}

export const conversations: Conversation[] = [
  { id: 'c1', type: 'direct', memberIds: ['me', 'u2'], adminIds: [], unreadCount: 2, lastMessage: createMessage() },
  { id: 'c2', type: 'direct', memberIds: ['me', 'u3'], adminIds: [], unreadCount: 0, lastMessage: null },
  {
    id: 'c3',
    type: 'group',
    name: 'Frontend Guild',
    memberIds: ['me', 'u2', 'u3'],
    adminIds: ['me'],
    unreadCount: 0,
    lastMessage: null,
  },
];

interface StateOptions {
  conversations?: Partial<RootState['conversations']>;
  messages?: Partial<RootState['messages']>;
}

export function createPreloadedState(options: StateOptions = {}): Partial<RootState> {
  return {
    users: { me: users.me, byId: users, loading: false, error: null },
    conversations: {
      list: conversations,
      selectedId: null,
      search: '',
      filter: 'all',
      typing: {},
      loading: false,
      error: null,
      ...options.conversations,
    },
    messages: { byConversation: {}, replyTo: null, editing: null, ...options.messages },
  };
}
