import mongoose from "mongoose";
import inventoryService from "../services/inventoryService.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Cáº­p nháº­t sá»‘ lÆ°á»£ng tá»“n kho cho má»™t biáº¿n thá»ƒ sáº£n pháº©m
 */
const updateVariantStock = catchAsync(async (req, res) => {
  const { productId, variantId } = req.params;
  const { quantity, reason, notes } = req.body;
  const userId = req.user.id;

  // Kiá»ƒm tra tham sá»‘ Ä‘áº§u vÃ o
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "ID sáº£n pháº©m khÃ´ng há»£p lá»‡");
  }

  if (!variantId || !mongoose.Types.ObjectId.isValid(variantId)) {
    throw new ApiError(400, "ID biáº¿n thá»ƒ khÃ´ng há»£p lá»‡");
  }

  if (quantity === undefined || !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
    throw new ApiError(400, "Sá»‘ lÆ°á»£ng tá»“n kho pháº£i lÃ  sá»‘ nguyÃªn khÃ´ng Ã¢m");
  }

  if (!reason) {
    throw new ApiError(400, "LÃ½ do cáº­p nháº­t lÃ  báº¯t buá»™c");
  }

  const updatedVariant = await inventoryService.updateVariantStock(
    productId,
    variantId,
    Number(quantity),
    reason,
    notes,
    userId
  );

  res.status(200).json({
    success: true,
    message: "Cáº­p nháº­t sá»‘ lÆ°á»£ng tá»“n kho thÃ nh cÃ´ng",
    data: updatedVariant,
  });
});

/**
 * Cáº­p nháº­t hÃ ng loáº¡t sá»‘ lÆ°á»£ng tá»“n kho
 */
const bulkUpdateStock = catchAsync(async (req, res) => {
  const { items, reason } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Danh sÃ¡ch cáº­p nháº­t khÃ´ng há»£p lá»‡");
  }

  if (!reason) {
    throw new ApiError(400, "LÃ½ do cáº­p nháº­t lÃ  báº¯t buá»™c");
  }

  // Kiá»ƒm tra cáº¥u trÃºc má»—i item
  items.forEach((item, index) => {
    if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
      throw new ApiError(400, `ID sáº£n pháº©m khÃ´ng há»£p lá»‡ táº¡i vá»‹ trÃ­ ${index}`);
    }

    if (!item.variantId || !mongoose.Types.ObjectId.isValid(item.variantId)) {
      throw new ApiError(400, `ID biáº¿n thá»ƒ khÃ´ng há»£p lá»‡ táº¡i vá»‹ trÃ­ ${index}`);
    }

    if (item.quantity === undefined || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 0) {
      throw new ApiError(400, `Sá»‘ lÆ°á»£ng tá»“n kho pháº£i lÃ  sá»‘ nguyÃªn khÃ´ng Ã¢m táº¡i vá»‹ trÃ­ ${index}`);
    }
  });

  const results = await inventoryService.bulkUpdateStock(items, reason, userId);

  res.status(200).json({
    success: true,
    message: "Cáº­p nháº­t hÃ ng loáº¡t sá»‘ lÆ°á»£ng tá»“n kho thÃ nh cÃ´ng",
    data: results,
  });
});

/**
 * Láº¥y danh sÃ¡ch sáº£n pháº©m cÃ³ tá»“n kho tháº¥p
 */
const getLowStockProducts = catchAsync(async (req, res) => {
  const { threshold = 5, page = 1, limit = 20 } = req.query;

  const result = await inventoryService.getLowStockProducts(Number(threshold), Number(page), Number(limit));

  res.status(200).json({
    success: true,
    data: result.products,
    pagination: result.pagination,
  });
});

/**
 * Láº¥y lá»‹ch sá»­ xuáº¥t nháº­p kho
 */
const getInventoryHistory = catchAsync(async (req, res) => {
  const {
    productId,
    variantId,
    sku,
    type,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const filters = {
    productId,
    variantId,
    sku,
    type,
    startDate,
    endDate,
  };

  const result = await inventoryService.getInventoryHistory(filters, Number(page), Number(limit), sortBy, sortOrder);

  res.status(200).json({
    success: true,
    data: result.history,
    pagination: result.pagination,
  });
});

export default {
  updateVariantStock,
  bulkUpdateStock,
  getLowStockProducts,
  getInventoryHistory,
};
