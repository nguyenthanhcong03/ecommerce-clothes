import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import Button from '@/components/common/Button/Button';

const DetailProduct = () => {
  <div className='container mx-auto px-4 py-8'>
    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
      {/* Left Column - Product Images */}
      <div className='space-y-4'>
        <div className='aspect-w-1 aspect-h-1 w-full'>
          <img src={product.images[currentImageIndex]} alt={product.name} className='h-full w-full object-cover' />
        </div>
        <div className='grid grid-cols-4 gap-2'>
          {product.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`aspect-w-1 aspect-h-1 w-full border-2 ${
                currentImageIndex === index ? 'border-black' : 'border-transparent'
              }`}
            >
              <img src={image} alt={`${product.name} ${index + 1}`} className='h-full w-full object-cover' />
            </button>
          ))}
        </div>
      </div>

      {/* Right Column - Product Info */}
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>{product.name}</h1>
          <div className='mt-4 flex items-center space-x-2'>
            <div className='flex items-center'>
              <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
              <span className='ml-1 text-sm text-gray-600'>
                {product.averageRating} ({product.totalReviews} đánh giá)
              </span>
            </div>
            <span className='text-gray-300'>|</span>
            <span className='text-sm text-gray-600'>SKU: {product.sku}</span>
          </div>
        </div>

        <div className='space-y-2'>
          <p className='text-3xl font-bold text-gray-900'>${product.price.toLocaleString()}</p>
          {product.discountPrice && (
            <p className='text-sm text-gray-500 line-through'>${product.discountPrice.toLocaleString()}</p>
          )}
        </div>

        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium text-gray-900'>Size</h3>
            <div className='mt-2 flex flex-wrap gap-2'>
              {product.variants.map((variant) => (
                <button
                  key={variant.size}
                  onClick={() => setSelectedSize(variant.size)}
                  className={`rounded border px-4 py-2 text-sm ${
                    selectedSize === variant.size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {variant.size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className='text-sm font-medium text-gray-900'>Màu sắc</h3>
            <div className='mt-2 flex flex-wrap gap-2'>
              {Array.from(new Set(product.variants.map((v) => v.color))).map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`rounded border px-4 py-2 text-sm ${
                    selectedColor === color
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className='text-sm font-medium text-gray-900'>Số lượng</h3>
            <div className='mt-2 flex items-center space-x-2'>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className='rounded border border-gray-300 px-3 py-1 hover:bg-gray-50'
              >
                -
              </button>
              <span className='w-12 text-center'>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className='rounded border border-gray-300 px-3 py-1 hover:bg-gray-50'
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className='flex space-x-4'>
          <Button fullWidth onClick={() => {}} disabled={!selectedSize || !selectedColor} className='flex-1'>
            Thêm vào giỏ
            <ShoppingCart className='ml-2 h-5 w-5' />
          </Button>
          <Button variant='secondary' onClick={() => {}} className='aspect-square'>
            <Heart className='h-5 w-5' />
          </Button>
        </div>

        <div className='prose prose-sm max-w-none border-t pt-6'>
          <h3 className='text-sm font-medium text-gray-900'>Mô tả sản phẩm</h3>
          <p className='mt-4 text-sm text-gray-600'>{product.description}</p>
        </div>

        <div className='border-t pt-6'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm font-medium text-gray-900'>Thương hiệu</p>
              <p className='mt-2 text-sm text-gray-600'>{product.brand}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-900'>Danh mục</p>
              <p className='mt-2 text-sm text-gray-600'>{product.category}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
};

export default DetailProduct;
