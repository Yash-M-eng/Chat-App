import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { chatApi } from '@/services/api';
import type { PresenceStatus, User } from '@/types/chat';

export interface UsersState {
  me: User | null;
  byId: Record<string, User>;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  me: null,
  byId: {},
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const [me, users] = await Promise.all([chatApi.getMe(), chatApi.getUsers()]);
  return { me, users };
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUserStatus(state, action: PayloadAction<{ userId: string; status: PresenceStatus }>) {
      const user = state.byId[action.payload.userId];
      if (!user) return;
      user.status = action.payload.status;
      if (action.payload.status === 'offline') {
        user.lastSeen = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.me = action.payload.me;
        state.byId = {};
        action.payload.users.forEach((user) => {
          state.byId[user.id] = user;
        });
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load users';
      });
  },
});

export const { setUserStatus } = usersSlice.actions;
export default usersSlice.reducer;
