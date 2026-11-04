import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { chatApi } from '@/services/api';
import type { Conversation, ConversationFilter, Message } from '@/types/chat';
import { deleteMessage, editMessage, receiveMessage, sendMessage } from '@/features/chat/messagesSlice';

export interface ConversationsState {
  list: Conversation[];
  selectedId: string | null;
  search: string;
  filter: ConversationFilter;
  typing: Record<string, string[]>;
  loading: boolean;
  error: string | null;
}

const initialState: ConversationsState = {
  list: [],
  selectedId: null,
  search: '',
  filter: 'all',
  typing: {},
  loading: false,
  error: null,
};

function moveToTopWithMessage(state: ConversationsState, message: Message) {
  const index = state.list.findIndex((c) => c.id === message.conversationId);
  if (index === -1) return;
  const conversation = state.list[index];
  conversation.lastMessage = message;
  state.list.splice(index, 1);
  state.list.unshift(conversation);
}

function updateLastMessageIfSame(state: ConversationsState, message: Message) {
  const conversation = state.list.find((c) => c.id === message.conversationId);
  if (conversation?.lastMessage?.id === message.id) {
    conversation.lastMessage = message;
  }
}

function replaceConversation(state: ConversationsState, updated: Conversation) {
  const index = state.list.findIndex((c) => c.id === updated.id);
  if (index !== -1) state.list[index] = updated;
}

export const fetchConversations = createAsyncThunk('conversations/fetchConversations', () =>
  chatApi.getConversations()
);

export const markConversationRead = createAsyncThunk('conversations/markRead', (conversationId: string) =>
  chatApi.markAsRead(conversationId)
);

export const addMember = createAsyncThunk(
  'conversations/addMember',
  ({ conversationId, userId }: { conversationId: string; userId: string }) =>
    chatApi.addMember(conversationId, userId)
);

export const removeMember = createAsyncThunk(
  'conversations/removeMember',
  ({ conversationId, userId }: { conversationId: string; userId: string }) =>
    chatApi.removeMember(conversationId, userId)
);

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    selectConversation(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setFilter(state, action: PayloadAction<ConversationFilter>) {
      state.filter = action.payload;
    },
    setTyping(state, action: PayloadAction<{ conversationId: string; userId: string; isTyping: boolean }>) {
      const { conversationId, userId, isTyping } = action.payload;
      const current = state.typing[conversationId] ?? [];
      if (isTyping && !current.includes(userId)) {
        state.typing[conversationId] = [...current, userId];
      }
      if (!isTyping) {
        state.typing[conversationId] = current.filter((id) => id !== userId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load conversations';
      })
      .addCase(markConversationRead.pending, (state, action) => {
        const conversation = state.list.find((c) => c.id === action.meta.arg);
        if (conversation) conversation.unreadCount = 0;
      })
      .addCase(addMember.fulfilled, (state, action) => {
        replaceConversation(state, action.payload);
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        replaceConversation(state, action.payload);
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        moveToTopWithMessage(state, action.payload);
      })
      .addCase(receiveMessage.fulfilled, (state, action) => {
        moveToTopWithMessage(state, action.payload);
        const conversation = state.list.find((c) => c.id === action.payload.conversationId);
        if (conversation && conversation.id !== state.selectedId) {
          conversation.unreadCount += 1;
        }
      })
      .addCase(editMessage.fulfilled, (state, action) => {
        updateLastMessageIfSame(state, action.payload);
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        updateLastMessageIfSame(state, action.payload);
      });
  },
});

export const { selectConversation, setSearch, setFilter, setTyping } = conversationsSlice.actions;
export default conversationsSlice.reducer;
