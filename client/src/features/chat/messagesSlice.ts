import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { chatApi } from '@/services/api';
import { CURRENT_USER_ID } from '@/shared/utils/constants';
import type { Message, MessageStatus } from '@/types/chat';
import type { RootState } from '@/app/store';

interface ConversationMessages {
  items: Message[];
  hasMore: boolean;
  loaded: boolean;
  loading: boolean;
  loadingOlder: boolean;
  error: string | null;
}

export interface MessagesState {
  byConversation: Record<string, ConversationMessages>;
  replyTo: Message | null;
  editing: Message | null;
}

const initialState: MessagesState = {
  byConversation: {},
  replyTo: null,
  editing: null,
};

function createEntry(): ConversationMessages {
  return { items: [], hasMore: false, loaded: false, loading: false, loadingOlder: false, error: null };
}

function getEntry(state: MessagesState, conversationId: string) {
  if (!state.byConversation[conversationId]) {
    state.byConversation[conversationId] = createEntry();
  }
  return state.byConversation[conversationId];
}

function replaceMessage(state: MessagesState, updated: Message) {
  const entry = state.byConversation[updated.conversationId];
  if (!entry) return;
  const index = entry.items.findIndex((m) => m.id === updated.id);
  if (index !== -1) entry.items[index] = updated;
}

export interface SendMessageArgs {
  conversationId: string;
  text: string;
  replyToId?: string | null;
}

export interface ReceiveMessageArgs {
  conversationId: string;
  senderId: string;
  text: string;
}

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  (conversationId: string) => chatApi.getMessages(conversationId),
  {
    condition: (conversationId, { getState }) => {
      const entry = (getState() as RootState).messages.byConversation[conversationId];
      return !entry?.loaded && !entry?.loading;
    },
  }
);

export const fetchOlderMessages = createAsyncThunk(
  'messages/fetchOlderMessages',
  (conversationId: string, { getState }) => {
    const entry = (getState() as RootState).messages.byConversation[conversationId];
    return chatApi.getMessages(conversationId, entry?.items[0]?.id);
  }
);

export const sendMessage = createAsyncThunk('messages/sendMessage', (args: SendMessageArgs, { requestId }) =>
  chatApi.sendMessage(args.conversationId, {
    text: args.text,
    replyToId: args.replyToId ?? null,
    clientId: requestId,
  })
);

export const receiveMessage = createAsyncThunk('messages/receiveMessage', (args: ReceiveMessageArgs) =>
  chatApi.sendMessage(args.conversationId, { text: args.text, senderId: args.senderId })
);

export const editMessage = createAsyncThunk(
  'messages/editMessage',
  ({ messageId, text }: { messageId: string; text: string }) => chatApi.editMessage(messageId, text)
);

export const deleteMessage = createAsyncThunk('messages/deleteMessage', (messageId: string) =>
  chatApi.deleteMessage(messageId)
);

export const toggleReaction = createAsyncThunk(
  'messages/toggleReaction',
  ({ messageId, emoji }: { messageId: string; emoji: string }) => chatApi.toggleReaction(messageId, emoji)
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    updateMessageStatus(
      state,
      action: PayloadAction<{ conversationId: string; messageId: string; status: MessageStatus }>
    ) {
      const { conversationId, messageId, status } = action.payload;
      const message = state.byConversation[conversationId]?.items.find((m) => m.id === messageId);
      if (message) message.status = status;
    },
    removeMessage(state, action: PayloadAction<{ conversationId: string; messageId: string }>) {
      const entry = state.byConversation[action.payload.conversationId];
      if (entry) {
        entry.items = entry.items.filter((m) => m.id !== action.payload.messageId);
      }
    },
    setReplyTo(state, action: PayloadAction<Message | null>) {
      state.replyTo = action.payload;
      state.editing = null;
    },
    setEditing(state, action: PayloadAction<Message | null>) {
      state.editing = action.payload;
      state.replyTo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state, action) => {
        const entry = getEntry(state, action.meta.arg);
        entry.loading = true;
        entry.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const entry = getEntry(state, action.meta.arg);
        entry.loading = false;
        entry.loaded = true;
        entry.items = action.payload.messages;
        entry.hasMore = action.payload.hasMore;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const entry = getEntry(state, action.meta.arg);
        entry.loading = false;
        entry.error = action.error.message ?? 'Failed to load messages';
      })
      .addCase(fetchOlderMessages.pending, (state, action) => {
        getEntry(state, action.meta.arg).loadingOlder = true;
      })
      .addCase(fetchOlderMessages.fulfilled, (state, action) => {
        const entry = getEntry(state, action.meta.arg);
        entry.loadingOlder = false;
        entry.items = [...action.payload.messages, ...entry.items];
        entry.hasMore = action.payload.hasMore;
      })
      .addCase(fetchOlderMessages.rejected, (state, action) => {
        getEntry(state, action.meta.arg).loadingOlder = false;
      })
      .addCase(sendMessage.pending, (state, action) => {
        const { conversationId, text, replyToId } = action.meta.arg;
        getEntry(state, conversationId).items.push({
          id: action.meta.requestId,
          clientId: action.meta.requestId,
          conversationId,
          senderId: CURRENT_USER_ID,
          text,
          replyToId: replyToId ?? null,
          createdAt: new Date().toISOString(),
          status: 'sending',
          reactions: [],
        });
        state.replyTo = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const entry = getEntry(state, action.meta.arg.conversationId);
        const index = entry.items.findIndex((m) => m.clientId === action.meta.requestId);
        if (index !== -1) entry.items[index] = action.payload;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        const entry = getEntry(state, action.meta.arg.conversationId);
        const message = entry.items.find((m) => m.clientId === action.meta.requestId);
        if (message) message.status = 'failed';
      })
      .addCase(receiveMessage.fulfilled, (state, action) => {
        const entry = state.byConversation[action.payload.conversationId];
        if (entry?.loaded) entry.items.push(action.payload);
      })
      .addCase(editMessage.fulfilled, (state, action) => {
        replaceMessage(state, action.payload);
        state.editing = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        replaceMessage(state, action.payload);
      })
      .addCase(toggleReaction.fulfilled, (state, action) => {
        replaceMessage(state, action.payload);
      });
  },
});

export const { updateMessageStatus, removeMessage, setReplyTo, setEditing } = messagesSlice.actions;
export default messagesSlice.reducer;
