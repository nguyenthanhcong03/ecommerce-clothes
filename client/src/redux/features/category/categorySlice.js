import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createCategory, getAllCategories, updateCategoryByIdAdmin } from '../../../services/categoryService.js';

// Định nghĩa async thunk để gọi API
export const fetchCategories = createAsyncThunk('categories/fetchCategories', async (params) => {
  try {
    const data = await getAllCategories(params);
    console.log('check res2', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
});

export const handleCreateCategory = createAsyncThunk(
  'categories/updateCategoryById',
  async ({ payload }, { rejectWithValue }) => {
    try {
      const res = await createCategory(payload);
      return res; // Trả về dữ liệu category đã cập nhật
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCategoryById = createAsyncThunk(
  'categories/updateCategoryById',
  async ({ categoryId, payload }, { rejectWithValue }) => {
    try {
      const res = await updateCategoryByIdAdmin(categoryId, payload);
      return res; // Trả về dữ liệu category đã cập nhật
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    total: 0,
    page: 0,
    pages: 1,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    isOpenForm: false,
    selectedCategory: null
  },
  reducers: {
    setIsOpenForm: (state, action) => {
      state.isOpenForm = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload.categories;
        // state.total = action.payload.pagination.total;
        // state.page = action.payload.page;
        // state.pages = action.payload.pages;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateCategoryById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCategoryById.fulfilled, (state, action) => {
        state.status = 'succeeded';

        // Cập nhật lại danh sách categories trong Redux
        // const updatedCategory = action.payload.data;
        // state.categories = state.categories.map((category) => (category._id === updatedCategory._id ? updatedCategory : category));

        // Đóng form chỉnh sửa
        state.isOpenForm = false;
        state.selectedCategory = null;
      })
      .addCase(updateCategoryById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  }
});

export const { setIsOpenForm, setSelectedCategory } = categorySlice.actions;

export default categorySlice.reducer;
