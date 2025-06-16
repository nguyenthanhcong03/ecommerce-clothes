import {
  login,
  register,
  callLogout,
  callFetchAccount,
  refreshAccessToken,
  changePassword
} from '@/services/authService';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Thunk actions
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password, rememberMe = false }, { rejectWithValue }) => {
    try {
      const data = await login(username, password, rememberMe);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ firstName, lastName, username, email, phone, password }, { rejectWithValue }) => {
    try {
      const data = await register({ firstName, lastName, username, email, phone, password });
      return data;
    } catch (err) {
      console.log('register error', err);
      return rejectWithValue(err.response?.data?.message || 'Đăng ký thất bại');
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
    console.log('first', oldPassword, newPassword);
    try {
      const data = await changePassword(oldPassword, newPassword);
      return data;
    } catch (err) {
      console.log('err', err);
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
    }
  },
  extraReducers: (builder) => {
    builder // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload || 'Đăng nhập thất bại';
        state.isAuthenticated = false;
        state.user = null;
        state.isLoading = false;
      })

      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.successMessage = 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload || 'Đăng ký thất bại';
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
        state.user = initialState.user;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        console.log('first', action.payload);
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.error = action.payload;
        state.user = null;
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

export const { setUser, setLoading, clearError, clearSuccessMessage } = accountSlice.actions;

export default accountSlice.reducer;
