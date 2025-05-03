import { UploadOutlined } from '@ant-design/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, Form, Input, message, Modal, Select, Switch, TreeSelect, Upload } from 'antd';
import React, { useCallback, useEffect, memo, useState, useMemo } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { fetchCategories } from '@/redux/features/category/categorySlice';
import { createProduct, updateProductById } from '@/redux/features/product/productSlice';
import { deleteMultipleFiles, uploadMultipleFiles } from '@/services/fileService';
import { buildTree } from '@/utils/convertFlatArrToTreeArr';

const { Option } = Select;

// Schema validation với Yup
const variantSchema = yup.object({
  sku: yup.string().required('SKU là bắt buộc'),
  size: yup.string().required('Kích thước là bắt buộc'),
  color: yup.string().required('Màu sắc là bắt buộc'),
  price: yup.number().required('Giá là bắt buộc').min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  discountPrice: yup.number().nullable().min(0, 'Giá giảm phải lớn hơn hoặc bằng 0'),
  stock: yup.number().required('Số lượng là bắt buộc').min(0, 'Số lượng phải lớn hơn hoặc bằng 0')
  // images: yup.array().of(yup.mixed()).min(1, 'Phải chọn ít nhất một ảnh')
});

const productSchema = yup.object({
  name: yup.string().required('Tên sản phẩm là bắt buộc'),
  description: yup.string().optional(),
  categoryId: yup.string().required('Danh mục là bắt buộc'),
  brand: yup.string().required('Thương hiệu là bắt buộc'),
  variants: yup.array().of(variantSchema).min(1, 'Phải có ít nhất một biến thể'),
  images: yup.array().of(yup.mixed()).min(1, 'Phải chọn ít nhất một ảnh'),
  tags: yup.array().of(yup.string()).optional(),
  isActive: yup.boolean().default(true)
});

// Component tải lên hình ảnh có thể tái sử dụng
const ImageUpload = memo(({ value = [], onChange, disabled }) => {
  const handleChange = useCallback(
    ({ fileList }) => {
      // Xử lý xem trước cho các file mới
      const newFileList = fileList.map((file) => {
        if (!file.url && !file.preview && file.originFileObj) {
          file.preview = URL.createObjectURL(file.originFileObj);
        }
        return file;
      });

      onChange(newFileList);
    },
    [onChange]
  );

  const onPreview = useCallback((file) => {
    const src = file.url || file.preview;
    const imgWindow = window.open(src);
    if (imgWindow) {
      imgWindow.document.write(`<img src="${src}" style="max-width: 100%; height: auto;" />`);
    }
  }, []);

  // Xử lý danh sách file để hiển thị
  const fileList = Array.isArray(value)
    ? value.map((item) => {
        if (typeof item === 'string') {
          // Nếu item là một chuỗi URL
          return {
            uid: item,
            name: item.split('/').pop(),
            status: 'done',
            url: item
          };
        } else if (item.url) {
          // Nếu item là một đối tượng có URL
          return {
            uid: item.public_id || item.uid || item.url,
            name: (item.public_id || item.url).split('/').pop(),
            status: 'done',
            url: item.url,
            public_id: item.public_id
          };
        }
        return item;
      })
    : [];

  return (
    <Upload
      multiple
      listType='picture-card'
      beforeUpload={() => false} // Không tải lên ngay lập tức
      fileList={fileList}
      onChange={handleChange}
      onPreview={onPreview}
      disabled={disabled}
    >
      {value?.length < 8 && !disabled && (
        <div>
          <UploadOutlined />
          <div style={{ marginTop: 8 }}>Chọn ảnh</div>
        </div>
      )}
    </Upload>
  );
});

const ProductForm = ({ loading, selectedProduct, onClose }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.category); // Lấy danh sách danh mục
  const { loading: productLoading } = useSelector((state) => state.product); // Trạng thái loading từ Redux
  const [uploading, setUploading] = useState(false); // Trạng thái đang tải file
  const [localFiles, setLocalFiles] = useState([]); // Lưu trữ danh sách file mới cho ảnh sản phẩm
  const [variantLocalFiles, setVariantLocalFiles] = useState([]); // Lưu trữ danh sách file mới cho ảnh biến thể

  // Chuyển đổi danh mục đã lọc thành cấu trúc cây cho TreeSelect - sử dụng useMemo
  const categoriesArray = useMemo(() => {
    const treeData = buildTree(categories);
    return treeData.map((item) => ({
      title: item.name,
      value: item._id,
      children: item?.children?.map((child) => ({
        title: child.name,
        value: child._id,
        children: child?.children?.map((grandchild) => ({
          title: grandchild.name,
          value: grandchild._id
        }))
      }))
    }));
  }, [categories]);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      brand: '',
      variants: [{ sku: '', size: '', color: '', price: 0, discountPrice: null, stock: 0, images: [] }],
      images: [],
      tags: [],
      isActive: true
    }
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant
  } = useFieldArray({
    control,
    name: 'variants'
  });

  // Khởi tạo giá trị form khi chỉnh sửa hoặc thêm mới
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
            : [{ sku: '', size: '', color: '', price: 0, discountPrice: null, stock: 0, images: [] }],
        images: selectedProduct.images ? selectedProduct.images.map((url) => ({ url })) : [],
        tags: selectedProduct.tags || [],
        isActive: selectedProduct.isActive ?? true
      });
    } else {
      // Khởi tạo form trống khi thêm mới sản phẩm
      reset({
        name: '',
        description: '',
        categoryId: '',
        brand: '',
        variants: [{ sku: '', size: '', color: '', price: 0, discountPrice: null, stock: 0, images: [] }],
        images: [],
        tags: [],
        isActive: true
      });
    }
    // Làm mới localFiles khi đóng/mở form
    setLocalFiles([]);
    setVariantLocalFiles([]);
  }, [selectedProduct, reset]);

  // Xử lý khi có thay đổi trong input files
  const handleFilesChange = useCallback((files, isVariant = false, variantIndex = null) => {
    // Lọc ra các file mới (có thuộc tính originFileObj)
    const newFiles = files.filter((file) => file.originFileObj);

    if (isVariant && variantIndex !== null) {
      // Cập nhật danh sách file cho biến thể cụ thể
      setVariantLocalFiles((prev) => {
        const updated = [...prev];
        if (!updated[variantIndex]) {
          updated[variantIndex] = [];
        }
        updated[variantIndex] = newFiles;
        return updated;
      });
    } else {
      // Cập nhật danh sách file chung cho sản phẩm
      setLocalFiles(newFiles);
    }
  }, []);

  // Tải file lên Cloudinary
  const uploadFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return [];

    setUploading(true);
    try {
      // Chỉ tải lên các file mới (có thuộc tính originFileObj)
      const filesToUpload = files.filter((file) => file.originFileObj).map((file) => file.originFileObj);

      if (filesToUpload.length === 0) {
        return files; // Nếu không có file mới nào cần tải lên
      }

      const response = await uploadMultipleFiles(filesToUpload);

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

      // Kết hợp file đã tải lên với file hiện có
      const existingFiles = files.filter((file) => !file.originFileObj);
      return [...existingFiles, ...uploadedFiles];
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
    async (formData) => {
      const resultAction = await dispatch(createProduct(formData));
      if (createProduct.fulfilled.match(resultAction)) {
        message.success('Thêm sản phẩm thành công!');
      } else if (createProduct.rejected.match(resultAction)) {
        message.error(resultAction.payload || 'Có lỗi xảy ra khi thêm sản phẩm');
      }
    },
    [dispatch] // dispatch là ổn định
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

        // Xử lý hình ảnh sản phẩm chính - tải lên cái mới, giữ lại cái cũ
        let processedImages = [...data.images];
        if (localFiles.length > 0) {
          // Kết hợp hình ảnh cũ (không có originFileObj) với hình ảnh mới (có originFileObj)
          const combinedFiles = [...data.images.filter((img) => !img.originFileObj), ...localFiles];
          processedImages = await uploadFiles(combinedFiles);
        }

        // Xử lý biến thể và hình ảnh của chúng
        const processedVariants = await Promise.all(
          data.variants.map(async (variant, index) => {
            let variantImages = variant.images || [];

            // Nếu có file ảnh mới cho biến thể này
            if (variantLocalFiles[index] && variantLocalFiles[index].length > 0) {
              const variantCombinedFiles = [
                ...(variant.images || []).filter((img) => !img.originFileObj),
                ...variantLocalFiles[index]
              ];
              variantImages = await uploadFiles(variantCombinedFiles);
            }

            return {
              ...variant,
              images: variantImages.map((file) => (typeof file === 'string' ? file : file.url))
            };
          })
        );

        // Chuẩn bị dữ liệu để gửi
        const formData = {
          name: data.name,
          description: data.description || '',
          categoryId: data.categoryId,
          brand: data.brand,
          variants: processedVariants,
          isActive: data.isActive,
          images: processedImages.map((file) => (typeof file === 'string' ? file : file.url)),
          tags: data.tags || []
        };

        console.log('formData', formData);

        // Xử lý xóa hình ảnh khi cập nhật
        if (selectedProduct) {
          // Xóa ảnh sản phẩm chính không còn được sử dụng
          const oldImages = selectedProduct.images || [];
          const currentImageUrls = processedImages.map((img) => (typeof img === 'string' ? img : img.url));
          const deletedImages = oldImages.filter((img) => !currentImageUrls.includes(img));

          // Xóa ảnh biến thể không còn được sử dụng
          const oldVariantImages =
            selectedProduct.variants?.reduce((acc, variant) => {
              if (variant.images && variant.images.length > 0) {
                acc.push(...variant.images);
              }
              return acc;
            }, []) || [];

          const currentVariantImageUrls = processedVariants.reduce((acc, variant) => {
            if (variant.images && variant.images.length > 0) {
              acc.push(...variant.images);
            }
            return acc;
          }, []);

          const deletedVariantImages = oldVariantImages.filter((img) => !currentVariantImageUrls.includes(img));

          // Tổng hợp tất cả ảnh cần xóa
          const allDeletedImages = [...deletedImages, ...deletedVariantImages];

          if (allDeletedImages.length > 0) {
            try {
              await deleteMultipleFiles(allDeletedImages.map((img) => img.public_id || img));
            } catch (deleteErr) {
              console.error('Lỗi khi xóa ảnh:', deleteErr);
            }
          }

          await handleUpdateProduct(formData);
        } else {
          await handleAddProduct(formData);
        }

        // Đặt lại local files sau khi gửi thành công
        setLocalFiles([]);
        setVariantLocalFiles([]);
        onClose(); // Đóng form sau khi hoàn tất
      } catch (error) {
        console.error('Error:', error);
        message.error('Có lỗi xảy ra khi xử lý sản phẩm.');
      } finally {
        setUploading(false);
      }
    },
    [localFiles, variantLocalFiles, selectedProduct, handleUpdateProduct, handleAddProduct, uploadFiles, onClose]
  );

  // Xử lý hủy form
  const handleCancel = useCallback(() => {
    if (isDirty || localFiles.length > 0 || variantLocalFiles.some((files) => files && files.length > 0)) {
      // Hiện dialog xác nhận nếu có thay đổi chưa lưu
      Modal.confirm({
        title: 'Xác nhận hủy',
        content: 'Bạn có chắc muốn hủy? Các thay đổi sẽ không được lưu.',
        okText: 'Hủy thay đổi',
        cancelText: 'Tiếp tục chỉnh sửa',
        onOk: () => {
          onClose(); // Đóng form
          setLocalFiles([]);
          setVariantLocalFiles([]);
        }
      });
    } else {
      onClose(); // Đóng form mà không cần xác nhận
      setLocalFiles([]);
      setVariantLocalFiles([]);
    }
  }, [isDirty, localFiles.length, variantLocalFiles, onClose]);

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
        loading: uploading || loading || productLoading,
        disabled: !isDirty && !localFiles.length && !variantLocalFiles.some((files) => files && files.length > 0)
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
                treeData={categoriesArray}
                placeholder='Chọn danh mục'
                treeDefaultExpandAll
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
        {/* <Form.Item
          label='Danh mục'
          help={errors.categoryId?.message}
          validateStatus={errors.categoryId ? 'error' : ''}
          required
        >
          <Controller
            name='categoryId'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder='Chọn danh mục'
                disabled={uploading || loading}
                value={field.value || undefined}
              >
                {categoriesArray.map((cat) => (
                  <Option key={cat._id} value={cat._id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            )}
          />
        </Form.Item> */}

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
        </Form.Item>

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

        {/* Biến thể sản phẩm */}
        <Form.Item
          label='Biến thể sản phẩm'
          help={errors.variants?.message}
          validateStatus={errors.variants ? 'error' : ''}
          required
        >
          {variantFields.map((field, index) => (
            <Card key={field.id} style={{ marginBottom: 16 }} title={`Biến thể ${index + 1}`}>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <Form.Item label='SKU' help={errors.variants?.[index]?.sku?.message}>
                  <Controller
                    name={`variants[${index}].sku`}
                    control={control}
                    render={({ field }) => <Input {...field} placeholder='Nhập SKU' disabled={uploading || loading} />}
                  />
                </Form.Item>

                <Form.Item label='Kích thước' help={errors.variants?.[index]?.size?.message}>
                  <Controller
                    name={`variants[${index}].size`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder='Nhập kích thước (ví dụ: S, M, L, XL)'
                        disabled={uploading || loading}
                      />
                    )}
                  />
                </Form.Item>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <Form.Item label='Màu sắc' help={errors.variants?.[index]?.color?.message}>
                  <Controller
                    name={`variants[${index}].color`}
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder='Nhập màu sắc' disabled={uploading || loading} />
                    )}
                  />
                </Form.Item>

                <Form.Item label='Giá' help={errors.variants?.[index]?.price?.message}>
                  <Controller
                    name={`variants[${index}].price`}
                    control={control}
                    render={({ field }) => (
                      <Input type='number' {...field} placeholder='Nhập giá' disabled={uploading || loading} />
                    )}
                  />
                </Form.Item>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <Form.Item label='Giá khuyến mãi' help={errors.variants?.[index]?.discountPrice?.message}>
                  <Controller
                    name={`variants[${index}].discountPrice`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        type='number'
                        {...field}
                        placeholder='Nhập giá khuyến mãi (nếu có)'
                        disabled={uploading || loading}
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item label='Số lượng' help={errors.variants?.[index]?.stock?.message}>
                  <Controller
                    name={`variants[${index}].stock`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        type='number'
                        {...field}
                        placeholder='Nhập số lượng trong kho'
                        disabled={uploading || loading}
                      />
                    )}
                  />
                </Form.Item>
              </div>

              <Form.Item label='Ảnh biến thể'>
                <Controller
                  name={`variants[${index}].images`}
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value || []}
                      onChange={(fileList) => {
                        field.onChange(fileList);
                        handleFilesChange(fileList, true, index);
                      }}
                      disabled={uploading || loading}
                    />
                  )}
                />
              </Form.Item>

              {variantFields.length > 1 && (
                <Button type='primary' danger onClick={() => removeVariant(index)} disabled={uploading || loading}>
                  Xóa biến thể
                </Button>
              )}
            </Card>
          ))}

          <Button
            type='dashed'
            onClick={() =>
              appendVariant({
                sku: '',
                size: '',
                color: '',
                price: 0,
                discountPrice: null,
                stock: 0,
                images: []
              })
            }
            disabled={uploading || loading}
            style={{ width: '100%' }}
          >
            + Thêm biến thể
          </Button>
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

        {/* Trạng thái hoạt động */}
        <Form.Item label='Trạng thái hoạt động'>
          <Controller
            name='isActive'
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onChange={field.onChange} disabled={uploading || loading} />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default memo(ProductForm);
