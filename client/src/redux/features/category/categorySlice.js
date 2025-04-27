import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createCategory,
  getAllCategories,
  updateCategoryByIdAdmin,
  deleteCategoryById
} from '../../../services/categoryService.js';

// Định nghĩa async thunk để gọi API
export const fetchCategories = createAsyncThunk('categories/fetchCategories', async (params, { rejectWithValue }) => {
  try {
    const data = await getAllCategories(params);
    console.log('first data', data);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const handleCreateCategory = createAsyncThunk(
  'categories/handleCreateCategory',
  async ({ payload }, { rejectWithValue }) => {
    try {
      const res = await createCategory(payload);
      return res;
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

export const handleDeleteCategory = createAsyncThunk(
  'categories/handleDeleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const res = await deleteCategoryById(categoryId);
      return { categoryId, data: res };
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
      // FETCH
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload.data;
        state.total = action.payload.pagination.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // CREATE
      .addCase(handleCreateCategory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(handleCreateCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories.unshift(action.payload.data); // Có thể cần gọi fetch lại tùy backend
      })
      .addCase(handleCreateCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // UPDATE
      .addCase(updateCategoryById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCategoryById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedCategory = action.payload.data;
        // Cập nhật category trong mảng categories
        const index = state.categories.findIndex((category) => category._id === updatedCategory._id);
        if (index !== -1) {
          state.categories[index] = updatedCategory;
        }
      })
      .addCase(updateCategoryById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // DELETE
      .addCase(handleDeleteCategory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(handleDeleteCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Xóa category khỏi mảng categories
        state.categories = state.categories.filter((category) => category._id !== action.payload.categoryId);
      })
      .addCase(handleDeleteCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  }
});

export const { setIsOpenForm, setSelectedCategory } = categorySlice.actions;

export default categorySlice.reducer;
