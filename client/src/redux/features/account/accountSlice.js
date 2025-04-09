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
      state.user = action.payload;
    },
    doGetAccountAction: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload;
    },
    doLogoutAction: (state) => {
      localStorage.removeItem('accessToken');
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
export const { doLoginAction, doGetAccountAction, doLogoutAction } = accountSlice.actions;

export default accountSlice.reducer;
