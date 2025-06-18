import { getUserByIdAPI, updateUserAPI } from '@/services/userService';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchUserById = createAsyncThunk('users/fetchById', async (userId, { rejectWithValue }) => {
  try {
    const response = await getUserByIdAPI(userId);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const updateUser = createAsyncThunk('users/update', async ({ userId, userData }, { rejectWithValue }) => {
  try {
    const response = await updateUserAPI(userId, userData);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

const initialState = {
  currentUser: null,
  loading: false,
  error: null,
  actionLoading: false,
  actionError: null
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

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

      .addCase(updateUser.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentUser = action.payload.data;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: 'Failed to update user' };
      });
  }
});

export default userSlice.reducer;
