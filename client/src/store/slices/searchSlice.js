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

// Action creators are generated for each case reducer function
export const { toggleSearchModal, openSearchModal, closeSearchModal } = searchSlice.actions;

export default searchSlice.reducer;
