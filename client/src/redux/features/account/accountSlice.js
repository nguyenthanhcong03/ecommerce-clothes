import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: {
    _id: '',
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    role: '',
    avatar: ''
  }
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    doLoginAction: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload.user;
    },
    doGetAccountAction: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload.user;
    },
    doLogoutAction: (state) => {
      state.isAuthenticated = false;
      state.user = {
        _id: '',
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        role: '',
        avatar: ''
      };
    }
  },
  extraReducers: (builder) => {}
});

// Action creators are generated for each case reducer function
export const { doLoginAction } = accountSlice.actions;

export default accountSlice.reducer;
