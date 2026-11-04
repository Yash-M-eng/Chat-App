import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { selectConversation } from '@/features/conversations/conversationsSlice';

type Theme = 'light' | 'dark';

interface UiState {
  theme: Theme;
  isGroupInfoOpen: boolean;
}

function getSavedTheme(): Theme {
  return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
}

const initialState: UiState = {
  theme: getSavedTheme(),
  isGroupInfoOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setGroupInfoOpen(state, action: PayloadAction<boolean>) {
      state.isGroupInfoOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(selectConversation, (state) => {
      state.isGroupInfoOpen = false;
    });
  },
});

export const { toggleTheme, setGroupInfoOpen } = uiSlice.actions;
export default uiSlice.reducer;
