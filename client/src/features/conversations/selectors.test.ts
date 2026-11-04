import { makeStore } from '@/app/store';
import { createPreloadedState } from '@/test/fixtures';
import type { RootState } from '@/app/store';
import { selectFilteredConversations, selectUnreadChatsCount } from './selectors';

function getState(conversations: Partial<RootState['conversations']> = {}) {
  return makeStore(createPreloadedState({ conversations })).getState();
}

describe('conversation selectors', () => {
  it('returns all conversations by default', () => {
    expect(selectFilteredConversations(getState())).toHaveLength(3);
  });

  it('filters unread conversations', () => {
    const result = selectFilteredConversations(getState({ filter: 'unread' }));
    expect(result.map((c) => c.id)).toEqual(['c1']);
  });

  it('filters groups', () => {
    const result = selectFilteredConversations(getState({ filter: 'groups' }));
    expect(result.map((c) => c.id)).toEqual(['c3']);
  });

  it('searches direct chats by the other user name', () => {
    const result = selectFilteredConversations(getState({ search: 'priya' }));
    expect(result.map((c) => c.id)).toEqual(['c1']);
  });

  it('searches groups by name', () => {
    const result = selectFilteredConversations(getState({ search: 'Guild' }));
    expect(result.map((c) => c.id)).toEqual(['c3']);
  });

  it('counts chats with unread messages', () => {
    expect(selectUnreadChatsCount(getState())).toBe(1);
  });
});
