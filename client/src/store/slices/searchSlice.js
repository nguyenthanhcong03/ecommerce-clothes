import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    toggleSearchModal: (state) => {
      state.isOpen = !state.isOpen;
    },
    openSearchModal: (state) => {
      state.isOpen = true;
    },
    closeSearchModal: (state) => {
      state.isOpen = false;
    }
  }
});

export const { toggleSearchModal, openSearchModal, closeSearchModal } = searchSlice.actions;

export default searchSlice.reducer;
