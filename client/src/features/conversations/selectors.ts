import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { getConversationName } from './utils';

const selectList = (state: RootState) => state.conversations.list;
const selectSearch = (state: RootState) => state.conversations.search;
const selectFilter = (state: RootState) => state.conversations.filter;
const selectUsersById = (state: RootState) => state.users.byId;

export const selectFilteredConversations = createSelector(
  [selectList, selectSearch, selectFilter, selectUsersById],
  (list, search, filter, usersById) => {
    const searchText = search.trim().toLowerCase();

    return list.filter((conversation) => {
      if (filter === 'unread' && conversation.unreadCount === 0) return false;
      if (filter === 'groups' && conversation.type !== 'group') return false;
      if (!searchText) return true;
      return getConversationName(conversation, usersById).toLowerCase().includes(searchText);
    });
  }
);

export const selectSelectedConversation = (state: RootState) =>
  state.conversations.list.find((c) => c.id === state.conversations.selectedId) ?? null;

export const selectUnreadChatsCount = (state: RootState) =>
  state.conversations.list.filter((c) => c.unreadCount > 0).length;
