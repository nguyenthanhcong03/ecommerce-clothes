import { login, callLogout, callFetchAccount, refreshAccessToken, changePassword } from '@/services/authService';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Thunk actions
export const loginUser = createAsyncThunk('auth/loginUser', async ({ username, password }, { rejectWithValue }) => {
  try {
    const data = await login(username, password);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await callLogout();
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Logout failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const data = await callFetchAccount();
    console.log('danh sách người dùng', data);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user data');
  }
});

export const refreshToken = createAsyncThunk('auth/refreshToken', async (_, { rejectWithValue }) => {
  try {
    const data = await refreshAccessToken();
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Token refresh failed');
  }
});

export const updateUserPassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const data = await changePassword(oldPassword, newPassword);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Password change failed');
    }
  }
);

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  successMessage: null,
  user: {
    _id: '',
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    role: '',
    avatar: '',
    accessToken: ''
  },
  preferences: {
    language: 'en',
    currency: 'USD',
    theme: 'light'
  }
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    // For manually setting user from localStorage or other sources
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

    setUserPreference(state, action) {
      const { key, value } = action.payload;
      if (state.preferences.hasOwnProperty(key)) {
        state.preferences[key] = value;
      }
    },

    // For manual login handling (SessionStorage/LocalStorage)
    doLoginAction: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.user = action.payload.user;
      state.user.accessToken = action.payload.accessToken;
    },

    // For manual account retrieval
    doGetAccountAction: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.user = action.payload;
    },

    // For manual logout handling
    doLogoutAction: (state) => {
      localStorage.removeItem('accessToken');
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
        state.error = action.payload || 'Login failed';
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
        state.isLoading = true;
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
        // Don't change authentication state here to prevent flicker
        // (let the interceptor handle this properly)
      })

      // Refresh token cases
      .addCase(refreshToken.fulfilled, (state, action) => {
        if (action.payload.accessToken) {
          state.user.accessToken = action.payload.accessToken;
          state.isAuthenticated = true;
          state.error = null;
        }
      })
      .addCase(refreshToken.rejected, (state) => {
        // If token refresh fails, user needs to login again
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
        state.successMessage = 'Password updated successfully';
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
  doGetAccountAction,
  doLogoutAction,
  clearError,
  clearSuccessMessage,
  setUserPreference
} = accountSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.account.user;
export const selectIsAuthenticated = (state) => state.account.isAuthenticated;
export const selectIsLoading = (state) => state.account.isLoading;
export const selectAuthError = (state) => state.account.error;
export const selectUserRole = (state) => state.account.user.role;
export const selectUserPreferences = (state) => state.account.preferences;

export default accountSlice.reducer;
