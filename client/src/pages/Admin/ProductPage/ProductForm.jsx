import ImageUpload from '@/pages/admin/ProductPage/ImageUpload';
import { deleteMultipleFilesAPI, uploadMultipleFilesAPI } from '@/services/fileService';
import { createProduct, fetchProducts, updateProductById } from '@/store/slices/adminProductSlice';
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

// Schema validation với Yup - SKU sẽ được tạo tự động ở backend
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

// // Component tải lên hình ảnh có thể tái sử dụng
// const ImageUpload = memo(({ value = [], onChange, disabled }) => {
//   const handleChange = useCallback(
//     ({ fileList }) => {
//       // Xử lý xem trước cho các file mới
//       const newFileList = fileList.map((file) => {
//         if (!file.url && !file.preview && file.originFileObj) {
//           file.preview = URL.createObjectURL(file.originFileObj);
//         }
//         return file;
//       });

//       onChange(newFileList);
//     },
//     [onChange]
//   );

//   const onPreview = useCallback((file) => {
//     const src = file.url || file.preview;
//     const imgWindow = window.open(src);
//     if (imgWindow) {
//       imgWindow.document.write(`<img src="${src}" style="max-width: 100%; height: auto;" />`);
//     }
//   }, []);

//   // Xử lý danh sách file để hiển thị
//   const fileList = Array.isArray(value)
//     ? value.map((item) => {
//         if (typeof item === 'string') {
//           // Nếu item là một chuỗi URL
//           return {
//             uid: item,
//             name: item.split('/').pop(),
//             status: 'done',
//             url: item
//           };
//         } else if (item.url) {
//           // Nếu item là một đối tượng có URL
//           return {
//             uid: item.public_id || item.uid || item.url,
//             name: (item.public_id || item.url).split('/').pop(),
//             status: 'done',
//             url: item.url,
//             public_id: item.public_id
//           };
//         }
//         return item;
//       })
//     : [];

//   return (
//     <Upload
//       multiple
//       listType='picture-card'
//       beforeUpload={() => false} // Không tải lên ngay lập tức
//       fileList={fileList}
//       onChange={handleChange}
//       onPreview={onPreview}
//       disabled={disabled}
//     >
//       {value?.length < 8 && !disabled && (
//         <div>
//           <UploadOutlined />
//           <div style={{ marginTop: 8 }}>Chọn ảnh</div>
//         </div>
//       )}
//     </Upload>
//   );
// });

const ProductForm = ({ selectedProduct, onClose }) => {
  const dispatch = useDispatch();
  const { categoriesTree } = useSelector((state) => state.category); // Lấy danh sách danh mục
  const { loading } = useSelector((state) => state.adminProduct); // Trạng thái loading từ Redux
  const [uploading, setUploading] = useState(false); // Trạng thái đang tải file
  const [localFiles, setLocalFiles] = useState([]); // Lưu trữ danh sách file mới cho ảnh sản phẩm
  const [productType, setProductType] = useState('áo'); // Mặc định là áo

  // State cho modal thêm biến thể
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const categoryTreeFormatted = formatTree(categoriesTree);

  // Size options based on product type
  const SIZES_BY_TYPE = useMemo(
    () => ({
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
    }),
    []
  );

  // Lấy danh sách size dựa trên loại sản phẩm hiện tại
  const currentSizeOptions = useMemo(() => SIZES_BY_TYPE[productType] || [], [SIZES_BY_TYPE, productType]);
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isDirty },
    reset
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      brand: '',
      variants: [{ size: '', color: '', price: 0, originalPrice: null, stock: 0 }],
      images: [],
      tags: []
    }
  });
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
    replace: replaceVariant
  } = useFieldArray({
    control,
    name: 'variants'
  }); // Khởi tạo giá trị form khi chỉnh sửa hoặc thêm mới

  useEffect(() => {
    dispatch(fetchCategories({}));
    if (selectedProduct) {
      // Điền thông tin sản phẩm được chọn vào form
      reset({
        name: selectedProduct.name || '',
        description: selectedProduct.description || '',
        categoryId: selectedProduct.categoryId?._id || '',
        brand: selectedProduct.brand || '',
        variants:
          selectedProduct.variants && selectedProduct.variants.length > 0
            ? selectedProduct.variants.map((v) => ({ ...v }))
            : [],
        images: selectedProduct.images ? selectedProduct.images.map((url) => ({ url })) : [],
        tags: selectedProduct.tags || []
      });

      // Nếu có biến thể, xác định loại sản phẩm (áo hoặc quần)
      if (selectedProduct.variants && selectedProduct.variants.length > 0) {
        const firstVariant = selectedProduct.variants[0];
        // Kiểm tra size để xác định loại sản phẩm
        // Nếu size là số -> quần, nếu là chữ -> áo
        const size = firstVariant.size;
        const isNumeric = /^\d+$/.test(size);
        setProductType(isNumeric ? 'quần' : 'áo');
      }
    } else {
      // Khởi tạo form trống khi thêm mới sản phẩm
      reset({
        name: '',
        description: '',
        categoryId: '',
        brand: '',
        variants: [],
        images: [],
        tags: []
      });
    }
    // Làm mới localFiles khi đóng/mở form
    setLocalFiles([]);
  }, [selectedProduct, reset, dispatch]);

  // Xử lý khi có thay đổi trong input files
  const handleFilesChange = useCallback((files) => {
    // Lọc ra các file mới (có thuộc tính originFileObj)
    const newFiles = files.filter((file) => file.originFileObj);

    // Cập nhật danh sách file chung cho sản phẩm
    setLocalFiles(newFiles);
  }, []);

  // Tải file lên Cloudinary
  const uploadFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return [];

    setUploading(true);
    try {
      const filesToUpload = files.filter((file) => file.originFileObj).map((file) => file.originFileObj);
      if (filesToUpload.length === 0) {
        return files; // Nếu không có file mới nào cần tải lên
      }

      const response = await uploadMultipleFilesAPI(filesToUpload);

      if (!response.success) {
        throw new Error('Tải lên ảnh thất bại');
      }

      // Chuyển đổi kết quả tải lên thành định dạng phù hợp
      const uploadedFiles = response.data.map((file) => ({
        uid: file.public_id,
        name: file.public_id.split('/').pop(),
        status: 'done',
        url: file.url,
        public_id: file.public_id
      }));

      return [...uploadedFiles];
    } catch (error) {
      console.error('Error uploading files:', error);
      message.error('Tải lên ảnh thất bại: ' + error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  }, []); // Không có dependencies vì không phụ thuộc vào state

  // Thêm sản phẩm mới

  const handleAddProduct = useCallback(
    (formData) => {
      dispatch(createProduct(formData))
        .unwrap()
        .then(() => message.success('Thêm sản phẩm thành công!'))
        .catch((err) => message.error('Có lỗi xảy ra khi thêm sản phẩm: ' + err));
    },
    [dispatch]
  );

  // Cập nhật sản phẩm hiện có
  const handleUpdateProduct = useCallback(
    async (formData) => {
      if (!selectedProduct?._id) return;

      const resultAction = await dispatch(updateProductById({ productId: selectedProduct._id, payload: formData }));
      if (updateProductById.fulfilled.match(resultAction)) {
        message.success('Cập nhật sản phẩm thành công!');
      } else if (updateProductById.rejected.match(resultAction)) {
        message.error(resultAction.payload || 'Có lỗi xảy ra khi cập nhật sản phẩm');
      }
    },
    [dispatch, selectedProduct?._id] // Chỉ phụ thuộc vào ID
  );

  // Xử lý submission form với upload files
  const onSubmit = useCallback(
    async (data) => {
      try {
        setUploading(true);

        // Lọc ra các ảnh đã tải lên từ trước
        let processedImages = [...data.images.filter((img) => !img.originFileObj)];

        if (localFiles.length > 0) {
          // Tải lên cloud các file mới
          const uploadImages = await uploadFiles(localFiles);
          // Thêm các file đã tải lên vào danh sách ảnh
          if (uploadImages.length > 0) {
            processedImages = [...processedImages, ...uploadImages];
          }
        }

        // Chuẩn bị dữ liệu để gửi
        const formData = {
          name: data.name,
          description: data.description || '',
          categoryId: data.categoryId,
          brand: data.brand,
          variants: data.variants,
          images: processedImages.map((file) => (typeof file === 'string' ? file : file.url)),
          tags: data.tags || [],
          productType: productType // Thêm thông tin loại sản phẩm
        };

        // Xử lý xóa hình ảnh khi cập nhật
        if (selectedProduct) {
          // Xóa ảnh sản phẩm chính không còn được sử dụng
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

          await handleUpdateProduct(formData);
        } else {
          await handleAddProduct(formData);
        }
      } catch (error) {
        console.error('Error:', error);
        message.error('Có lỗi xảy ra khi xử lý sản phẩm.');
      } finally {
        setUploading(false);
        // Đặt lại local files sau khi gửi thành công
        setLocalFiles([]);
        onClose(); // Đóng form sau khi hoàn tất
        dispatch(fetchProducts({ page: 1, limit: 5 }));
      }
    },
    [localFiles, selectedProduct, dispatch, handleUpdateProduct, handleAddProduct, uploadFiles, onClose, productType]
  );
  // Xử lý hủy form
  const handleCancel = useCallback(() => {
    if (isDirty || localFiles.length > 0) {
      // Hiện dialog xác nhận nếu có thay đổi chưa lưu
      Modal.confirm({
        title: 'Xác nhận hủy',
        content: 'Bạn có chắc muốn hủy? Các thay đổi sẽ không được lưu.',
        okText: 'Hủy thay đổi',
        cancelText: 'Tiếp tục chỉnh sửa',
        onOk: () => {
          onClose(); // Đóng form
          setLocalFiles([]);
        }
      });
    } else {
      onClose();
      setLocalFiles([]);
    }
  }, [isDirty, localFiles.length, onClose]);
  // Tạo SKU tự động - xóa vì sẽ được xử lý ở backend
  // const generateSKU = useCallback(...)

  // Kiểm tra xem biến thể đã tồn tại chưa true/false
  const variantExists = useCallback(
    (size, color) => {
      return variantFields.some((variant) => variant.size === size && variant.color === color);
    },
    [variantFields]
  );

  // Thêm biến thể mới
  const addVariant = useCallback(() => {
    if (!selectedSize) {
      message.warning('Vui lòng chọn kích thước');
      return;
    }

    if (!selectedColor) {
      message.warning('Vui lòng chọn màu sắc');
      return;
    }

    // Kiểm tra nếu biến thể đã tồn tại
    if (variantExists(selectedSize, selectedColor)) {
      message.error(`Biến thể với kích thước ${selectedSize} và màu ${selectedColor} đã tồn tại!`);
      return;
    }

    // Tạo biến thể mới - SKU sẽ được tạo ở backend
    const newVariant = {
      color: selectedColor,
      size: selectedSize,
      price: 0,
      originalPrice: null,
      stock: 0
    };

    // Thêm biến thể mới vào danh sách
    appendVariant(newVariant);

    // Đóng modal và reset giá trị
    setVariantModalVisible(false);
    setSelectedSize('');
    setSelectedColor('');

    // Hiển thị thông báo thành công
    message.success('Đã thêm biến thể mới!');
  }, [selectedSize, selectedColor, appendVariant, variantExists]);

  // Mở modal thêm biến thể
  const openVariantModal = useCallback(() => {
    setSelectedSize('');
    setSelectedColor('');
    setVariantModalVisible(true);
  }, []);

  return (
    <Modal
      width={800}
      open={true}
      title={selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
      okText={selectedProduct ? 'Cập nhật' : 'Tạo mới'}
      cancelText='Hủy'
      okButtonProps={{
        autoFocus: true,
        htmlType: 'submit',
        loading: uploading || loading,
        disabled: !isDirty && !localFiles.length
      }}
      onCancel={handleCancel}
      destroyOnClose
      onOk={handleSubmit(onSubmit)}
      maskClosable={false}
    >
      <Form layout='vertical' onFinish={handleSubmit(onSubmit)}>
        {/* Trường tên sản phẩm */}
        <Form.Item
          label='Tên sản phẩm'
          help={errors.name?.message}
          validateStatus={errors.name ? 'error' : ''}
          required
        >
          <Controller
            name='name'
            control={control}
            render={({ field }) => <Input {...field} placeholder='Nhập tên sản phẩm' disabled={uploading || loading} />}
          />
        </Form.Item>
        {/* Trường chọn danh mục */}
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
                // treeDefaultExpandAll // Mặc định mở rộng tất cả danh mục
                allowClear={true}
                disabled={uploading || loading}
                onChange={(value) => {
                  // Chuyển đổi undefined thành null để phù hợp với schema
                  field.onChange(value === undefined ? null : value);
                }}
                value={field.value || undefined}
                notFoundContent='Không có danh mục phù hợp'
              />
            )}
          />
        </Form.Item>
        {/* Trường thương hiệu */}
        <Form.Item
          label='Thương hiệu'
          help={errors.brand?.message}
          validateStatus={errors.brand ? 'error' : ''}
          required
        >
          <Controller
            name='brand'
            control={control}
            render={({ field }) => <Input {...field} placeholder='Nhập thương hiệu' disabled={uploading || loading} />}
          />
        </Form.Item>{' '}
        {/* Trường nhập mô tả */}
        <Form.Item label='Mô tả' help={errors.description?.message} validateStatus={errors.description ? 'error' : ''}>
          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <Input.TextArea {...field} placeholder='Nhập mô tả' rows={3} disabled={uploading || loading} />
            )}
          />
        </Form.Item>
        {/* Trường tải lên hình ảnh */}
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
                disabled={uploading || loading}
              />
            )}
          />
        </Form.Item>
        {/* Loại sản phẩm: Áo hoặc Quần */}
        <Form.Item label='Loại sản phẩm'>
          <Radio.Group
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            disabled={uploading || loading}
          >
            <Radio.Button value='áo'>Áo</Radio.Button>
            <Radio.Button value='quần'>Quần</Radio.Button>
          </Radio.Group>
          <div className='mt-1 text-xs text-gray-500'>
            {productType === 'áo' ? 'Size áo: S, M, L, XL, XXL' : 'Size quần: 28, 29, 30, 31, 32,...'}
          </div>
        </Form.Item>{' '}
        {/* Biến thể sản phẩm */}
        <Form.Item
          label='Biến thể sản phẩm'
          help={errors.variants?.message}
          validateStatus={errors.variants ? 'error' : ''}
          required
        >
          {/* Hiển thị bảng biến thể */}
          {variantFields.length > 0 ? (
            <div className='mb-4'>
              <div className='mb-2 font-medium'>Bảng biến thể đã tạo:</div>{' '}
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
                          render={({ field }) => <Input type='number' {...field} disabled={uploading || loading} />}
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
                          render={({ field }) => <Input type='number' {...field} disabled={uploading || loading} />}
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
                          render={({ field }) => <Input type='number' {...field} disabled={uploading || loading} />}
                        />
                      </Form.Item>
                    )
                  },
                  {
                    title: 'Hành động',
                    dataIndex: 'index',
                    render: (index) => (
                      <Button type='text' danger onClick={() => removeVariant(index)} disabled={uploading || loading}>
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
                disabled={uploading || loading}
              >
                Thêm biến thể
              </Button>{' '}
              <div className='mt-2 text-xs text-gray-500'>
                SKU sẽ được tạo tự động dựa trên loại sản phẩm, thương hiệu, tên, size và màu.
              </div>
            </div>
          ) : (
            <div className='rounded border border-dashed border-gray-300 bg-gray-50 p-4 text-center'>
              <p className='mb-4 text-gray-500'>Chưa có biến thể nào. Nhấn "Thêm biến thể" để tạo một biến thể mới.</p>
              <Button type='primary' onClick={openVariantModal} icon={<PlusOutlined />} disabled={uploading || loading}>
                Thêm biến thể
              </Button>
            </div>
          )}
        </Form.Item>
        {/* Trường tags */}
        <Form.Item label='Tags'>
          <Controller
            name='tags'
            control={control}
            render={({ field }) => (
              <Select
                mode='tags'
                {...field}
                placeholder='Nhập tags (ấn Enter để thêm)'
                disabled={uploading || loading}
              />
            )}
          />
        </Form.Item>
      </Form>

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
          <Form.Item label='Chọn màu sắc' required>
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
          <Form.Item label='Chọn kích thước' required>
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
        </Form>
      </Modal>
    </Modal>
  );
};

ProductForm.propTypes = {
  selectedProduct: PropTypes.object, // Sản phẩm được chọn để chỉnh sửa
  onClose: PropTypes.func.isRequired // Hàm callback khi đóng form
};

export default memo(ProductForm);
