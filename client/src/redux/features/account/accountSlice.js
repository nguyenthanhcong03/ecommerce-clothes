import { login, callLogout } from '@/services/authService';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const data = await login(credentials);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await callLogout();
  } catch (error) {
    console.log(error);
  }
});

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: {
    _id: '',
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    role: '',
    avatar: '',
    accessToken: ''
  }
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    // dùng khi cần set thủ công từ localStorage, v.v.
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    doLoginAction: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload.user;
      state.user.accessToken = action.payload.accessToken;
    },
    doGetAccountAction: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload;
    },
    doLogoutAction: (state) => {
      // localStorage.removeItem('accessToken');
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = {
        _id: '',
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        role: '',
        avatar: '',
        accessToken: ''
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  }
});

// Action creators are generated for each case reducer function
export const { doLoginAction, setUser, doGetAccountAction, doLogoutAction } = accountSlice.actions;

export default accountSlice.reducer;
