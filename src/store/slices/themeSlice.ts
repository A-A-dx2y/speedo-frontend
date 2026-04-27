import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  mode: 'dark' | 'light';
}


const savedTheme = localStorage.getItem('speedo-theme') as 'dark' | 'light' | null;

const initialState: ThemeState = {
  mode: savedTheme || 'dark',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('speedo-theme', state.mode);
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.mode = action.payload;
      localStorage.setItem('speedo-theme', state.mode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
