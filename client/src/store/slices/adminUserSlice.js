import {
  banUserAPI,
  createUserByAdminAPI,
  deleteUserAPI,
  getAllUsersAPI,
  getUserByIdAPI,
  unbanUserAPI,
  updateUserAPI,
  updateUserByAdminAPI
} from '@/services/userService';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Async thunks
export const fetchAllUsers = createAsyncThunk('users/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await getAllUsersAPI(params);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const fetchUserById = createAsyncThunk('users/fetchById', async (userId, { rejectWithValue }) => {
  try {
    const response = await getUserByIdAPI(userId);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const createUserByAdmin = createAsyncThunk('users/createByAdmin', async (userData, { rejectWithValue }) => {
  try {
    const response = await createUserByAdminAPI(userData);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const updateUserAdmin = createAsyncThunk(
  'users/updateAdmin',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await updateUserByAdminAPI(userId, userData);
      return response;
    } catch (error) {
      console.log('adminUserSlice.js - updateUserAdmin error:', error);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateUser = createAsyncThunk('users/update', async ({ userId, userData }, { rejectWithValue }) => {
  try {
    const response = await updateUserAPI(userId, userData);
    console.log('response', response);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const deleteUser = createAsyncThunk('users/delete', async (userId, { rejectWithValue }) => {
  try {
    const response = await deleteUserAPI(userId);
    return { ...response, userId };
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const banUser = createAsyncThunk('users/ban', async ({ userId, banInfo }, { rejectWithValue }) => {
  try {
    const response = await banUserAPI(userId, banInfo);
    return { ...response, userId };
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const unbanUser = createAsyncThunk('users/unban', async (userId, { rejectWithValue }) => {
  try {
    const response = await unbanUserAPI(userId);
    return { ...response, userId };
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

const initialState = {
  users: [],
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  },
  filters: {
    role: '',
    isBlocked: null
  },
  sort: {
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  loading: false,
  actionLoading: false,
  error: null
};

const adminUserSlice = createSlice({
  name: 'adminUser',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1;
    },
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilter: (state) => {
      state.filters = {
        role: null,
        isBlocked: null
      };
    },
    setSort: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sort = {
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc'
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch users' };
      })

      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.data;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch user' };
      })

      // Thêm vào extraReducers
      .addCase(createUserByAdmin.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createUserByAdmin.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.users.unshift(action.payload.data);
        state.pagination.total += 1;
      })
      .addCase(createUserByAdmin.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: 'Failed to create user' };
      })

      // Update user by admin
      .addCase(updateUserAdmin.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateUserAdmin.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentUser = action.payload.data;

        // Also update in the users list if present
        const index = state.users.findIndex((user) => user._id === action.payload.data._id);
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
      })
      .addCase(updateUserAdmin.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: 'Failed to update user' };
      })

      // Update user (regular user update)
      .addCase(updateUser.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentUser = action.payload.data;

        // Also update in the users list if present
        const index = state.users.findIndex((user) => user._id === action.payload.data._id);
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: 'Failed to update user' };
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.actionLoading = false;

        // Remove from the users list
        state.users = state.users.filter((user) => user._id !== action.payload.userId);

        // Clear current user if it's the same
        if (state.currentUser && state.currentUser._id === action.payload.userId) {
          state.currentUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: 'Failed to delete user' };
      })

      // Ban user
      .addCase(banUser.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(banUser.fulfilled, (state, action) => {
        state.actionLoading = false;

        // Update in the users list if present
        const index = state.users.findIndex((user) => user._id === action.payload.data._id);
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }

        // Update current user if it's the same
        if (state.currentUser && state.currentUser._id === action.payload.data._id) {
          state.currentUser = action.payload.data;
        }
      })
      .addCase(banUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: 'Failed to ban user' };
      })

      // Unban user
      .addCase(unbanUser.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(unbanUser.fulfilled, (state, action) => {
        state.actionLoading = false;

        // Update in the users list if present
        const index = state.users.findIndex((user) => user._id === action.payload.data._id);
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }

        // Update current user if it's the same
        if (state.currentUser && state.currentUser._id === action.payload.data._id) {
          state.currentUser = action.payload.data;
        }
      })
      .addCase(unbanUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: 'Failed to unban user' };
      });
  }
});

export const { setPage, setLimit, setFilter, resetFilter, setSort } = adminUserSlice.actions;
export default adminUserSlice.reducer;
