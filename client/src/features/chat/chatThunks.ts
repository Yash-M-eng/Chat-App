import type { AppThunk } from '@/app/store';
import { setTyping } from '@/features/conversations/conversationsSlice';
import { setUserStatus } from '@/features/users/usersSlice';
import { CURRENT_USER_ID } from '@/shared/utils/constants';
import type { Message } from '@/types/chat';
import { receiveMessage, removeMessage, sendMessage, updateMessageStatus, type SendMessageArgs } from './messagesSlice';

const autoReplies = [
  'Got it 👍',
  'Sure, give me a minute.',
  'Haha nice',
  'Can we talk about this later?',
  'Sounds good to me',
  'Okay, done!',
  'Let me check and get back to you.',
  'Thanks!',
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function simulateReply(conversationId: string, senderId: string): AppThunk {
  return (dispatch) => {
    dispatch(setTyping({ conversationId, userId: senderId, isTyping: true }));

    setTimeout(() => {
      dispatch(setTyping({ conversationId, userId: senderId, isTyping: false }));
      dispatch(receiveMessage({ conversationId, senderId, text: randomItem(autoReplies) }));
    }, 2500);
  };
}

export function simulateMessageStatus(message: Message): AppThunk {
  return (dispatch, getState) => {
    const { id, conversationId } = message;

    setTimeout(() => {
      dispatch(updateMessageStatus({ conversationId, messageId: id, status: 'delivered' }));
    }, 1000);

    setTimeout(() => {
      dispatch(updateMessageStatus({ conversationId, messageId: id, status: 'read' }));

      const conversation = getState().conversations.list.find((c) => c.id === conversationId);
      if (!conversation) return;
      const others = conversation.memberIds.filter((memberId) => memberId !== CURRENT_USER_ID);
      if (others.length > 0 && Math.random() < 0.6) {
        dispatch(simulateReply(conversationId, randomItem(others)));
      }
    }, 2500);
  };
}

export function sendChatMessage(args: SendMessageArgs): AppThunk {
  return async (dispatch) => {
    const result = await dispatch(sendMessage(args));
    if (sendMessage.fulfilled.match(result)) {
      dispatch(simulateMessageStatus(result.payload));
    }
  };
}

export function retryMessage(message: Message): AppThunk {
  return (dispatch) => {
    dispatch(removeMessage({ conversationId: message.conversationId, messageId: message.id }));
    dispatch(
      sendChatMessage({
        conversationId: message.conversationId,
        text: message.text,
        replyToId: message.replyToId,
      })
    );
  };
}

export function simulateRandomActivity(): AppThunk {
  return (dispatch, getState) => {
    const { list } = getState().conversations;
    if (list.length === 0) return;

    const conversation = randomItem(list);
    const others = conversation.memberIds.filter((id) => id !== CURRENT_USER_ID);
    if (others.length === 0) return;

    const senderId = randomItem(others);
    dispatch(setUserStatus({ userId: senderId, status: 'online' }));
    dispatch(simulateReply(conversation.id, senderId));

    const users = Object.values(getState().users.byId).filter(
      (user) => user.id !== CURRENT_USER_ID && user.id !== senderId && user.status === 'online'
    );
    if (users.length > 0 && Math.random() < 0.3) {
      dispatch(setUserStatus({ userId: randomItem(users).id, status: 'offline' }));
    }
  };
}
