import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    toggleSearch: (state) => {
      state.isOpen = !state.isOpen;
    }
  }
});

// Action creators are generated for each case reducer function
export const { toggleSearch } = searchSlice.actions;

export default searchSlice.reducer;
