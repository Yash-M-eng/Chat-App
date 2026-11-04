import { createMessage } from '@/test/fixtures';
import reducer, { fetchMessages, receiveMessage, sendMessage, setReplyTo } from './messagesSlice';

const sendArgs = { conversationId: 'c1', text: 'Hi!' };
const receiveArgs = { conversationId: 'c1', senderId: 'u2', text: 'Hello there' };

describe('messagesSlice', () => {
  it('adds a temporary message while sending', () => {
    const state = reducer(undefined, sendMessage.pending('temp-1', sendArgs));
    const items = state.byConversation.c1.items;

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: 'temp-1', text: 'Hi!', status: 'sending', senderId: 'me' });
  });

  it('replaces the temporary message with the saved one', () => {
    let state = reducer(undefined, sendMessage.pending('temp-1', sendArgs));
    const saved = createMessage({ id: 'server-1', clientId: 'temp-1', senderId: 'me', text: 'Hi!', status: 'sent' });
    state = reducer(state, sendMessage.fulfilled(saved, 'temp-1', sendArgs));

    expect(state.byConversation.c1.items).toEqual([saved]);
  });

  it('marks the message as failed when sending fails', () => {
    let state = reducer(undefined, sendMessage.pending('temp-1', sendArgs));
    state = reducer(state, sendMessage.rejected(new Error('Network error'), 'temp-1', sendArgs));

    expect(state.byConversation.c1.items[0].status).toBe('failed');
  });

  it('clears the reply after sending', () => {
    let state = reducer(undefined, setReplyTo(createMessage()));
    state = reducer(state, sendMessage.pending('temp-1', { ...sendArgs, replyToId: 'm1' }));

    expect(state.replyTo).toBeNull();
    expect(state.byConversation.c1.items[0].replyToId).toBe('m1');
  });

  it('adds incoming messages only to loaded conversations', () => {
    const incoming = createMessage({ id: 'm2' });

    let state = reducer(undefined, receiveMessage.fulfilled(incoming, 'r1', receiveArgs));
    expect(state.byConversation.c1).toBeUndefined();

    state = reducer(state, fetchMessages.fulfilled({ messages: [], hasMore: false }, 'r2', 'c1'));
    state = reducer(state, receiveMessage.fulfilled(incoming, 'r3', receiveArgs));
    expect(state.byConversation.c1.items).toEqual([incoming]);
  });
});
