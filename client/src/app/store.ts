import { combineReducers, configureStore, type Action, type ThunkAction } from '@reduxjs/toolkit';
import usersReducer from '@/features/users/usersSlice';
import conversationsReducer from '@/features/conversations/conversationsSlice';
import messagesReducer from '@/features/chat/messagesSlice';
import uiReducer from './uiSlice';

const rootReducer = combineReducers({
  users: usersReducer,
  conversations: conversationsReducer,
  messages: messagesReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;
