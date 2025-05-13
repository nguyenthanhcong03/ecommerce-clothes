import { login, callLogout, callFetchAccount, refreshAccessToken, changePassword } from '@/services/authService';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Thunk actions
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password, rememberMe = false }, { rejectWithValue }) => {
    try {
      const data = await login(username, password, rememberMe);
      return data;
    } catch (err) {
      console.log('first', err);
      return rejectWithValue(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await callLogout();
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Đăng xuất thất bại');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const data = await callFetchAccount();
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Không thể tải thông tin người dùng');
  }
});

export const refreshToken = createAsyncThunk('auth/refreshToken', async (_, { rejectWithValue }) => {
  try {
    const data = await refreshAccessToken();
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Làm mới token thất bại');
  }
});

export const updateUserPassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const data = await changePassword(oldPassword, newPassword);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Thay đổi mật khẩu thất bại');
    }
  }
);

const initialState = {
  user: {
    _id: '',
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    role: '',
    avatar: ''
  },
  isAuthenticated: false,
  isLoading: true,
  error: null,
  successMessage: null
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    clearError(state) {
      state.error = null;
    },

    clearSuccessMessage(state) {
      state.successMessage = null;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },

    doLogoutAction: (state) => {
      // CASE 1: For httpOnly cookies
      // Server will clear cookies on logout response

      // CASE 2: For non-httpOnly cookies
      // Clear cookies on the client side
      // Note: Need to import Cookies from 'js-cookie' in this file if this is uncommented
      /* 
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      */

      // CASE 3: For localStorage fallback
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Reset authentication state
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
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
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.user.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload || 'Đăng nhập thất bại';
        state.isAuthenticated = false;
        state.isLoading = false;
      })

      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = initialState.user;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Still logout the user locally even if server logout failed
        state.user = initialState.user;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch current user cases
      .addCase(fetchCurrentUser.pending, (state) => {
        // state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
        state.isAuthenticated = false;
      })

      // Update password cases
      .addCase(updateUserPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.successMessage = 'Thay đổi mật khẩu thành công';
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Action creators are generated for each case reducer function
export const {
  doLoginAction,
  setUser,
  setLoading,
  doGetAccountAction,
  doLogoutAction,
  clearError,
  clearSuccessMessage
} = accountSlice.actions;

// // Selectors
// export const selectCurrentUser = (state) => state.account.user;
// export const selectIsAuthenticated = (state) => state.account.isAuthenticated;
// export const selectIsLoading = (state) => state.account.isLoading;
// export const selectAuthError = (state) => state.account.error;
// export const selectUserRole = (state) => state.account.user.role;
// export const selectUserPreferences = (state) => state.account.preferences;

export default accountSlice.reducer;
