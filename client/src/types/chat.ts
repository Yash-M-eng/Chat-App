export type PresenceStatus = 'online' | 'away' | 'offline';

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: PresenceStatus;
  lastSeen?: string;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  clientId?: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  editedAt?: string | null;
  deleted?: boolean;
  replyToId?: string | null;
  status: MessageStatus;
  reactions: Reaction[];
}

export type ConversationType = 'direct' | 'group';

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  avatar?: string;
  description?: string;
  memberIds: string[];
  adminIds: string[];
  unreadCount: number;
  lastMessage: Message | null;
}

export interface MessagesPage {
  messages: Message[];
  hasMore: boolean;
}

export type ConversationFilter = 'all' | 'unread' | 'groups';
