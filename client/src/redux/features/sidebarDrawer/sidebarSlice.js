import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  type: ''
};

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen;
    },
    setType: (state, action) => {
      state.type = action.payload;
    }
  }
});

// Action creators are generated for each case reducer function
export const { toggleSidebar, setType } = sidebarSlice.actions;

export default sidebarSlice.reducer;
