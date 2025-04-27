import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createProduct,
  deleteProductById,
  getAllProducts,
  getProductById,
  updateProductByIdAdmin,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  addProductReview,
  getProductReviews,
  updateProductStatus
} from '@/services/productService.js';

// Định nghĩa async thunk để gọi API
export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params, { rejectWithValue }) => {
  try {
    const response = await getAllProducts(params);
    console.log(response);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const fetchProductById = createAsyncThunk('products/fetchProductById', async (id, { rejectWithValue }) => {
  try {
    const response = await getProductById(id);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const handleCreateProduct = createAsyncThunk(
  'products/handleCreateProduct',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await createProduct(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateProductById = createAsyncThunk(
  'products/updateProductById',
  async ({ productId, payload }, { rejectWithValue }) => {
    try {
      const response = await updateProductByIdAdmin(productId, payload);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const handleDeleteProductById = createAsyncThunk(
  'products/handleDeleteProductById',
  async ({ productId }, { rejectWithValue }) => {
    try {
      const response = await deleteProductById(productId);
      return { ...response.data, id: productId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (limit = 8, { rejectWithValue }) => {
    try {
      const response = await getFeaturedProducts(limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async ({ categoryId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await getProductsByCategory(categoryId, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const handleSearchProducts = createAsyncThunk(
  'products/handleSearchProducts',
  async ({ query, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await searchProducts(query, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const handleAddProductReview = createAsyncThunk(
  'products/handleAddProductReview',
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await addProductReview(productId, reviewData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'products/fetchProductReviews',
  async ({ productId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await getProductReviews(productId, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const handleUpdateProductStatus = createAsyncThunk(
  'products/handleUpdateProductStatus',
  async ({ productId, isActive }, { rejectWithValue }) => {
    try {
      const response = await updateProductStatus(productId, isActive);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    total: 0,
    page: 0,
    pages: 1,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    currentProduct: null,
    featuredProducts: [],
    categoryProducts: [],
    searchResults: [],
    reviews: [],
    totalReviews: 0,
    isOpenForm: false,
    selectedProduct: null,
    isDetailModalOpen: false,
    modalProductId: null
  },
  reducers: {
    setIsOpenForm: (state, action) => {
      state.isOpenForm = action.payload;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    openProductDetailModal: (state, action) => {
      state.isDetailModalOpen = true;
      state.modalProductId = action.payload;
    },
    closeProductDetailModal: (state) => {
      state.isDetailModalOpen = false;
      state.modalProductId = null;
    },
    resetError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL PRODUCTS
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload.data;
        state.total = action.payload.pagination.total;
        state.page = action.payload.pagination.current;
        state.pages = action.payload.pagination.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // GET PRODUCT BY ID
      .addCase(fetchProductById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentProduct = action.payload.data;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // CREATE PRODUCT
      .addCase(handleCreateProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(handleCreateProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products.unshift(action.payload.data);
      })
      .addCase(handleCreateProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // UPDATE PRODUCT
      .addCase(updateProductById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProductById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedProduct = action.payload.data;
        state.products = state.products.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        );
        if (state.currentProduct && state.currentProduct._id === updatedProduct._id) {
          state.currentProduct = updatedProduct;
        }
      })
      .addCase(updateProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // DELETE PRODUCT
      .addCase(handleDeleteProductById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(handleDeleteProductById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const deletedId = action.payload.id;
        state.products = state.products.filter((product) => product._id !== deletedId);
      })
      .addCase(handleDeleteProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // FEATURED PRODUCTS
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.featuredProducts = action.payload.data;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // PRODUCTS BY CATEGORY
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categoryProducts = action.payload.data;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // SEARCH PRODUCTS
      .addCase(handleSearchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(handleSearchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.searchResults = action.payload.data;
      })
      .addCase(handleSearchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ADD REVIEW
      .addCase(handleAddProductReview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(handleAddProductReview.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(handleAddProductReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // FETCH REVIEWS
      .addCase(fetchProductReviews.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reviews = action.payload.data.reviews;
        state.totalReviews = action.payload.pagination.total;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // UPDATE PRODUCT STATUS
      .addCase(handleUpdateProductStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(handleUpdateProductStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedProduct = action.payload.data;
        state.products = state.products.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        );
      })
      .addCase(handleUpdateProductStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const {
  setIsOpenForm,
  setSelectedProduct,
  openProductDetailModal,
  closeProductDetailModal,
  resetError,
  resetStatus
} = productSlice.actions;

export default productSlice.reducer;
