import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllUsers, updateUserByIdAdmin } from '../../../services/userService.js';

// Định nghĩa async thunk để gọi API
export const fetchUsers = createAsyncThunk('users/fetchUsers', async (params) => {
  try {
    const data = await getAllUsers(params);
    console.log('check res2', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
});

export const updateUserById = createAsyncThunk(
  'users/updateUserById',
  async ({ userId, payload }, { rejectWithValue }) => {
    try {
      const res = await updateUserByIdAdmin(userId, payload);
      return res; // Trả về dữ liệu user đã cập nhật
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    total: 0,
    page: 0,
    pages: 1,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    isOpenForm: false,
    selectedUser: null
  },
  reducers: {
    setIsOpenForm: (state, action) => {
      state.isOpenForm = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload.data;
        state.total = action.payload.pagination.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateUserById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserById.fulfilled, (state, action) => {
        state.status = 'succeeded';

        // Cập nhật lại danh sách users trong Redux
        // const updatedUser = action.payload.data;
        // state.users = state.users.map((user) => (user._id === updatedUser._id ? updatedUser : user));

        // Đóng form chỉnh sửa
        state.isOpenForm = false;
        state.selectedUser = null;
      })
      .addCase(updateUserById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  }
});

export const { setIsOpenForm, setSelectedUser } = userSlice.actions;

export default userSlice.reducer;
