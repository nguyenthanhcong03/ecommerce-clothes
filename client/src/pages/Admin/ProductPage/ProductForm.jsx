import ImageUpload from '@/pages/admin/ProductPage/ImageUpload';
import { deleteMultipleFilesAPI, uploadMultipleFilesAPI } from '@/services/fileService';
import { createProduct, updateProductById } from '@/store/slices/adminProductSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import { COLOR_OPTIONS } from '@/utils/constants';
import { formatTree } from '@/utils/format/formatTree';
import { PlusOutlined } from '@ant-design/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form, Input, message, Modal, Radio, Select, Table, TreeSelect } from 'antd';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

const { Option } = Select;

const variantSchema = yup.object({
  size: yup.string().required('Kích thước là bắt buộc'),
  color: yup.string().required('Màu sắc là bắt buộc'),
  price: yup.number().required('Giá là bắt buộc').min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  originalPrice: yup.number().nullable().min(0, 'Giá giảm phải lớn hơn hoặc bằng 0'),
  stock: yup.number().required('Số lượng là bắt buộc').min(0, 'Số lượng phải lớn hơn hoặc bằng 0')
});

const productSchema = yup.object({
  name: yup.string().required('Tên sản phẩm là bắt buộc'),
  description: yup.string().optional(),
  categoryId: yup.string().required('Danh mục là bắt buộc'),
  brand: yup.string().required('Thương hiệu là bắt buộc'),
  variants: yup.array().of(variantSchema).min(1, 'Phải có ít nhất một biến thể'),
  images: yup.array().of(yup.mixed()).min(1, 'Phải chọn ít nhất một ảnh'),
  tags: yup.array().of(yup.string()).optional()
});

const SIZES_BY_TYPE = {
  áo: [
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: 'XXL', value: 'XXL' }
  ],
  quần: [
    { label: '28', value: '28' },
    { label: '29', value: '29' },
    { label: '30', value: '30' },
    { label: '31', value: '31' },
    { label: '32', value: '32' },
    { label: '33', value: '33' },
    { label: '34', value: '34' },
    { label: '35', value: '35' },
    { label: '36', value: '36' }
  ]
};

const FORM_DEFAULT_VALUES = {
  name: '',
  description: '',
  categoryId: '',
  brand: '',
  variants: [],
  images: [],
  tags: []
};

// Helper functions
const determineProductType = (variants) => {
  if (!variants || variants.length === 0) return 'áo';
  const firstVariant = variants[0];
  const size = firstVariant.size;
  const isNumeric = /^\d+$/.test(size);
  return isNumeric ? 'quần' : 'áo';
};

const formatProductForForm = (product) => ({
  name: product.name || '',
  description: product.description || '',
  categoryId: product.categoryId?._id || '',
  brand: product.brand || '',
  variants: product.variants && product.variants.length > 0 ? product.variants.map((v) => ({ ...v })) : [],
  images: product.images ? product.images.map((url) => ({ url })) : [],
  tags: product.tags || []
});

const ProductForm = ({ selectedProduct, onClose, onRefresh }) => {
  const dispatch = useDispatch();
  const { categoriesTree } = useSelector((state) => state.category);
  const { loading } = useSelector((state) => state.adminProduct);

  // State management
  const [uploading, setUploading] = useState(false);
  const [localFiles, setLocalFiles] = useState([]);
  const [productType, setProductType] = useState('áo');
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const categoryTreeFormatted = formatTree(categoriesTree);
  const currentSizeOptions = useMemo(() => SIZES_BY_TYPE[productType] || [], [productType]);
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: FORM_DEFAULT_VALUES
  });
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant
  } = useFieldArray({
    control,
    name: 'variants'
  });

  // Initialize form when product changes
  useEffect(() => {
    dispatch(fetchCategories({}));

    if (selectedProduct) {
      const formData = formatProductForForm(selectedProduct);
      reset(formData);
      setProductType(determineProductType(selectedProduct.variants));
    } else {
      reset(FORM_DEFAULT_VALUES);
      setProductType('áo');
    }

    setLocalFiles([]);
  }, [selectedProduct, reset, dispatch]);
  // File handling
  const handleFilesChange = useCallback((files) => {
    const newFiles = files.filter((file) => file.originFileObj);
    setLocalFiles(newFiles);
  }, []);

  const uploadFiles = useCallback(async (files) => {
    if (!files?.length) return [];

    setUploading(true);
    try {
      const filesToUpload = files.filter((file) => file.originFileObj).map((file) => file.originFileObj);

      if (!filesToUpload.length) return files;

      const response = await uploadMultipleFilesAPI(filesToUpload);

      if (!response.success) {
        throw new Error('Tải lên ảnh thất bại');
      }

      return response.data.detailedResults.map((file) => ({
        uid: file.public_id,
        name: file.public_id.split('/').pop(),
        status: 'done',
        url: file.url,
        public_id: file.public_id
      }));
    } catch (error) {
      console.error('Error uploading files:', error);
      message.error('Tải lên ảnh thất bại: ' + error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  }, []); // Không có dependencies vì không phụ thuộc vào state  // Product operations
  const handleAddProduct = useCallback(
    async (formData) => {
      const resultAction = await dispatch(createProduct(formData));

      if (createProduct.fulfilled.match(resultAction)) {
        message.success('Thêm sản phẩm thành công!');
        return true;
      } else if (createProduct.rejected.match(resultAction)) {
        message.error('Có lỗi xảy ra khi thêm sản phẩm: ' + (resultAction.payload || 'Lỗi không xác định'));
        return false;
      }
      return false;
    },
    [dispatch]
  );

  const handleUpdateProduct = useCallback(
    async (formData) => {
      if (!selectedProduct?._id) return false;

      const resultAction = await dispatch(
        updateProductById({
          productId: selectedProduct._id,
          payload: formData
        })
      );

      if (updateProductById.fulfilled.match(resultAction)) {
        message.success('Cập nhật sản phẩm thành công!');
        return true;
      } else if (updateProductById.rejected.match(resultAction)) {
        message.error(resultAction.payload || 'Có lỗi xảy ra khi cập nhật sản phẩm');
        return false;
      }
      return false;
    },
    [dispatch, selectedProduct?._id]
  );
  // Form submission
  const processImages = useCallback(
    async (data) => {
      let processedImages = [...data.images.filter((img) => !img.originFileObj)];

      if (localFiles.length > 0) {
        const uploadImages = await uploadFiles(localFiles);
        if (uploadImages.length > 0) {
          processedImages = [...processedImages, ...uploadImages];
        }
      }

      return processedImages;
    },
    [localFiles, uploadFiles]
  );

  const handleImageCleanup = useCallback(
    async (processedImages) => {
      if (!selectedProduct) return;

      const oldImages = selectedProduct.images || [];
      const currentImageUrls = processedImages.map((img) => (typeof img === 'string' ? img : img.url));
      const deletedImages = oldImages.filter((img) => !currentImageUrls.includes(img));

      if (deletedImages.length > 0) {
        try {
          await deleteMultipleFilesAPI(deletedImages.map((img) => img.public_id || img));
        } catch (deleteErr) {
          console.error('Lỗi khi xóa ảnh:', deleteErr);
        }
      }
    },
    [selectedProduct]
  );

  const onSubmit = useCallback(
    async (data) => {
      try {
        setUploading(true);

        const processedImages = await processImages(data);

        const formData = {
          name: data.name,
          description: data.description || '',
          categoryId: data.categoryId,
          brand: data.brand,
          variants: data.variants,
          images: processedImages.map((file) => (typeof file === 'string' ? file : file.url)),
          tags: data.tags || [],
          productType: productType
        };

        let success = false;

        if (selectedProduct) {
          await handleImageCleanup(processedImages);
          success = await handleUpdateProduct(formData);
        } else {
          success = await handleAddProduct(formData);
        }

        if (success) {
          setLocalFiles([]);
          onClose();
          onRefresh();
        }
      } catch (error) {
        console.error('Error:', error);
        message.error('Có lỗi xảy ra khi xử lý sản phẩm.');
      } finally {
        setUploading(false);
      }
    },
    [
      processImages,
      productType,
      selectedProduct,
      handleImageCleanup,
      handleUpdateProduct,
      handleAddProduct,
      onClose,
      onRefresh
    ]
  );

  const handleCancel = useCallback(() => {
    const hasChanges = isDirty || localFiles.length > 0;

    if (hasChanges) {
      Modal.confirm({
        title: 'Xác nhận hủy',
        content: 'Bạn có chắc muốn hủy? Các thay đổi sẽ không được lưu.',
        okText: 'Hủy thay đổi',
        cancelText: 'Tiếp tục chỉnh sửa',
        onOk: () => {
          onClose();
          setLocalFiles([]);
        }
      });
    } else {
      onClose();
      setLocalFiles([]);
    }
  }, [isDirty, localFiles.length, onClose]);

  const variantExists = useCallback(
    (size, color) => {
      return variantFields.some((variant) => variant.size === size && variant.color === color);
    },
    [variantFields]
  );

  const addVariant = useCallback(() => {
    if (!selectedSize) {
      message.warning('Vui lòng chọn kích thước');
      return;
    }

    if (!selectedColor) {
      message.warning('Vui lòng chọn màu sắc');
      return;
    }

    if (variantExists(selectedSize, selectedColor)) {
      message.error(`Biến thể với kích thước ${selectedSize} và màu ${selectedColor} đã tồn tại!`);
      return;
    }

    const newVariant = {
      color: selectedColor,
      size: selectedSize,
      price: 0,
      originalPrice: null,
      stock: 0
    };

    appendVariant(newVariant);
    setVariantModalVisible(false);
    setSelectedSize('');
    setSelectedColor('');
    message.success('Đã thêm biến thể mới!');
  }, [selectedSize, selectedColor, appendVariant, variantExists]);

  const openVariantModal = useCallback(() => {
    setSelectedSize('');
    setSelectedColor('');
    setVariantModalVisible(true);
  }, []);
  // Memoized values
  const isEditMode = Boolean(selectedProduct);
  const modalTitle = isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới';
  const submitButtonText = isEditMode ? 'Cập nhật' : 'Tạo mới';
  const isFormDisabled = uploading || loading;

  return (
    <Modal
      width={800}
      open={true}
      title={modalTitle}
      okText={submitButtonText}
      cancelText='Hủy'
      okButtonProps={{
        autoFocus: true,
        htmlType: 'submit',
        loading: isFormDisabled,
        disabled: !isDirty && !localFiles.length
      }}
      onCancel={handleCancel}
      destroyOnClose
      onOk={handleSubmit(onSubmit)}
      maskClosable={false}
    >
      {' '}
      <Form layout='vertical' onFinish={handleSubmit(onSubmit)}>
        {/* Product Name */}
        <Form.Item
          label='Tên sản phẩm'
          help={errors.name?.message}
          validateStatus={errors.name ? 'error' : ''}
          required
        >
          <Controller
            name='name'
            control={control}
            render={({ field }) => <Input {...field} placeholder='Nhập tên sản phẩm' disabled={isFormDisabled} />}
          />
        </Form.Item>
        {/* Category */}
        <Form.Item
          label='Danh mục'
          help={errors.categoryId?.message}
          validateStatus={errors.categoryId ? 'error' : ''}
          required
        >
          <Controller
            name='categoryId'
            control={control}
            render={({ field }) => (
              <TreeSelect
                {...field}
                style={{ width: '100%' }}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeData={categoryTreeFormatted}
                placeholder='Chọn danh mục'
                allowClear={true}
                disabled={isFormDisabled}
                onChange={(value) => field.onChange(value === undefined ? null : value)}
                value={field.value || undefined}
                notFoundContent='Không có danh mục phù hợp'
              />
            )}
          />
        </Form.Item>
        {/* Brand */}
        <Form.Item
          label='Thương hiệu'
          help={errors.brand?.message}
          validateStatus={errors.brand ? 'error' : ''}
          required
        >
          <Controller
            name='brand'
            control={control}
            render={({ field }) => <Input {...field} placeholder='Nhập thương hiệu' disabled={isFormDisabled} />}
          />
        </Form.Item>
        {/* Description */}
        <Form.Item label='Mô tả' help={errors.description?.message} validateStatus={errors.description ? 'error' : ''}>
          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <Input.TextArea {...field} placeholder='Nhập mô tả' rows={3} disabled={isFormDisabled} />
            )}
          />
        </Form.Item>
        {/* Product Images */}
        <Form.Item
          label='Ảnh sản phẩm'
          help={errors.images?.message}
          validateStatus={errors.images ? 'error' : ''}
          required
        >
          <Controller
            name='images'
            control={control}
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={(fileList) => {
                  field.onChange(fileList);
                  handleFilesChange(fileList);
                }}
                disabled={isFormDisabled}
              />
            )}
          />
        </Form.Item>
        {/* Product Type */}
        <Form.Item label='Loại sản phẩm'>
          <Radio.Group value={productType} onChange={(e) => setProductType(e.target.value)} disabled={isFormDisabled}>
            <Radio.Button value='áo'>Áo</Radio.Button>
            <Radio.Button value='quần'>Quần</Radio.Button>
          </Radio.Group>
          <div className='mt-1 text-xs text-gray-500'>
            {productType === 'áo' ? 'Size áo: S, M, L, XL, XXL' : 'Size quần: 28, 29, 30, 31, 32,...'}
          </div>
        </Form.Item>{' '}
        {/* Product Variants */}
        <Form.Item
          label='Biến thể sản phẩm'
          help={errors.variants?.message}
          validateStatus={errors.variants ? 'error' : ''}
          required
        >
          {variantFields.length > 0 ? (
            <div className='mb-4'>
              <div className='mb-2 font-medium'>Bảng biến thể đã tạo:</div>
              <Table
                dataSource={variantFields.map((field, index) => ({
                  key: field.id,
                  index,
                  color: field.color,
                  size: field.size,
                  price: field.price,
                  originalPrice: field.originalPrice,
                  stock: field.stock
                }))}
                columns={[
                  { title: 'Màu sắc', dataIndex: 'color' },
                  { title: 'Kích thước', dataIndex: 'size' },
                  {
                    title: 'Giá',
                    dataIndex: 'index',
                    render: (index) => (
                      <Form.Item noStyle help={errors.variants?.[index]?.price?.message}>
                        <Controller
                          name={`variants[${index}].price`}
                          control={control}
                          render={({ field }) => <Input type='number' {...field} disabled={isFormDisabled} />}
                        />
                      </Form.Item>
                    )
                  },
                  {
                    title: 'Giá niêm yết',
                    dataIndex: 'index',
                    render: (index) => (
                      <Form.Item noStyle help={errors.variants?.[index]?.originalPrice?.message}>
                        <Controller
                          name={`variants[${index}].originalPrice`}
                          control={control}
                          render={({ field }) => <Input type='number' {...field} disabled={isFormDisabled} />}
                        />
                      </Form.Item>
                    )
                  },
                  {
                    title: 'Tồn kho',
                    dataIndex: 'index',
                    render: (index) => (
                      <Form.Item noStyle help={errors.variants?.[index]?.stock?.message}>
                        <Controller
                          name={`variants[${index}].stock`}
                          control={control}
                          render={({ field }) => <Input type='number' {...field} disabled={isFormDisabled} />}
                        />
                      </Form.Item>
                    )
                  },
                  {
                    title: 'Hành động',
                    dataIndex: 'index',
                    render: (index) => (
                      <Button type='text' danger onClick={() => removeVariant(index)} disabled={isFormDisabled}>
                        Xóa
                      </Button>
                    )
                  }
                ]}
                pagination={false}
                size='small'
                bordered
              />
              <Button
                type='dashed'
                onClick={openVariantModal}
                className='mt-4'
                icon={<PlusOutlined />}
                disabled={isFormDisabled}
              >
                Thêm biến thể
              </Button>
              <div className='mt-2 text-xs text-gray-500'>
                SKU sẽ được tạo tự động dựa trên loại sản phẩm, thương hiệu, tên, size và màu.
              </div>
            </div>
          ) : (
            <div className='rounded border border-dashed border-gray-300 bg-gray-50 p-4 text-center'>
              <p className='mb-4 text-gray-500'>
                Chưa có biến thể nào. Nhấn &quot;Thêm biến thể&quot; để tạo một biến thể mới.
              </p>
              <Button type='primary' onClick={openVariantModal} icon={<PlusOutlined />} disabled={isFormDisabled}>
                Thêm biến thể
              </Button>
            </div>
          )}
        </Form.Item>
        {/* Tags */}
        <Form.Item label='Tags'>
          <Controller
            name='tags'
            control={control}
            render={({ field }) => (
              <Select mode='tags' {...field} placeholder='Nhập tags (ấn Enter để thêm)' disabled={isFormDisabled} />
            )}
          />
        </Form.Item>
      </Form>{' '}
      {/* Modal thêm biến thể */}
      <Modal
        title='Thêm biến thể mới'
        open={variantModalVisible}
        onOk={addVariant}
        onCancel={() => setVariantModalVisible(false)}
        okText='Thêm biến thể'
        cancelText='Hủy'
        okButtonProps={{ disabled: !selectedSize || !selectedColor }}
      >
        <Form layout='vertical'>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <Form.Item label='Chọn màu sắc' required style={{ marginBottom: 0 }}>
                <Select
                  placeholder='Chọn màu sắc'
                  value={selectedColor}
                  onChange={setSelectedColor}
                  style={{ width: '100%' }}
                >
                  {COLOR_OPTIONS.map((color) => (
                    <Option key={color.name} value={color.name}>
                      <div className='flex items-center'>
                        <span
                          className='mr-2 inline-block h-4 w-4 rounded-full border border-gray-300'
                          style={{ backgroundColor: color.hex }}
                        ></span>
                        {color.name}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item label='Chọn kích thước' required style={{ marginBottom: 0 }}>
                <Select
                  placeholder='Chọn kích thước'
                  value={selectedSize}
                  onChange={setSelectedSize}
                  style={{ width: '100%' }}
                >
                  {currentSizeOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </Modal>
  );
};

ProductForm.propTypes = {
  selectedProduct: PropTypes.object, // Sản phẩm được chọn để chỉnh sửa
  onClose: PropTypes.func.isRequired, // Hàm callback khi đóng form
  onRefresh: PropTypes.func.isRequired // Hàm callback để refresh danh sách sản phẩm
};

export default memo(ProductForm);
