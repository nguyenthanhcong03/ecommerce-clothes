import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createCategoryAPI,
  deleteCategoryByIdAPI,
  getAllCategoriesAPI,
  getCategoryTreeAPI,
  updateCategoryByIdAPI
} from '@/services/categoryService.js';

export const fetchCategories = createAsyncThunk('categories/fetchCategories', async (params, { rejectWithValue }) => {
  try {
    const data = await getAllCategoriesAPI(params);
    console.log('categories', data);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const getCategoriesTree = createAsyncThunk('categories/getCategoriesTree', async (_, { rejectWithValue }) => {
  try {
    const response = await getCategoryTreeAPI();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const createCategory = createAsyncThunk('categories/createCategory', async (payload, { rejectWithValue }) => {
  try {
    const res = await createCategoryAPI(payload);
    return res;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateCategoryById = createAsyncThunk(
  'categories/updateCategoryById',
  async ({ categoryId, payload }, { rejectWithValue }) => {
    try {
      const res = await updateCategoryByIdAPI(categoryId, payload);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCategory = createAsyncThunk('categories/deleteCategory', async (categoryId, { rejectWithValue }) => {
  try {
    const res = await deleteCategoryByIdAPI(categoryId);
    return { categoryId, data: res };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa danh mục';
    return rejectWithValue({
      message: errorMessage,
      code: error.response?.status || 500
    });
  }
});

// Trạng thái ban đầu
const initialState = {
  categories: [],
  categoriesTree: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    search: ''
  },
  loading: false,
  treeLoading: false,
  error: null
};

const adminCategorySlice = createSlice({
  name: 'adminCategory',
  initialState,
  reducers: {
    // Xóa trạng thái lỗi
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // LẤY DANH SÁCH DANH MỤC
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // LẤY CÂY DANH MỤC
      .addCase(getCategoriesTree.pending, (state) => {
        state.treeLoading = true;
        state.error = null;
      })
      .addCase(getCategoriesTree.fulfilled, (state, action) => {
        state.treeLoading = false;
        state.categoriesTree = action.payload || [];
      })
      .addCase(getCategoriesTree.rejected, (state, action) => {
        state.treeLoading = false;
        state.error = action.payload || action.error.message;
      })

      // TẠO DANH MỤC MỚI
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          // Thêm vào đầu nếu là danh mục cha hoặc không có danh mục cha
          if (!action.payload.data.parentId) {
            state.categories.unshift(action.payload.data);
          } else {
            // Ngược lại thêm vào cuối (thường danh mục con sẽ hiển thị sau danh mục cha)
            state.categories.push(action.payload.data);
          }
          state.total += 1;
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // CẬP NHẬT DANH MỤC
      .addCase(updateCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCategory = action.payload.data;
        if (updatedCategory) {
          // Cập nhật danh mục trong state
          const index = state.categories.findIndex((category) => category._id === updatedCategory._id);
          if (index !== -1) {
            state.categories[index] = updatedCategory;
          }
        }
      })
      .addCase(updateCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // XÓA DANH MỤC
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.categoryId) {
          // Xóa danh mục khỏi state
          state.categories = state.categories.filter((category) => category._id !== action.payload.categoryId);
          // Cũng lọc ra bất kỳ danh mục con nào có danh mục này làm cha (trong trường hợp backend không xóa theo cascade)
          state.categories = state.categories.filter((category) => category.parentId !== action.payload.categoryId);
          state.total = Math.max(0, state.total - 1); // Giảm tổng số
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Có lỗi xảy ra khi xóa danh mục';
      });
  }
});

export const { setIsOpenForm, setSelectedCategory, clearError, setFilters } = adminCategorySlice.actions;

export default adminCategorySlice.reducer;
