import { UploadOutlined } from '@ant-design/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, Form, Input, message, Modal, Select, Switch, Upload } from 'antd';
import React, { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { fetchCategories } from '@/redux/features/category/categorySlice';
import { handleCreateProduct, setIsOpenForm, updateProductById } from '@/redux/features/product/productSlice';

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

const ProductForm = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.category);
  const { products, status, error, page, pages, total, isOpenForm, selectedProduct } = useSelector(
    (state) => state.product
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
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

  // Điền dữ liệu khi chỉnh sửa
  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 10 })); // Lấy danh sách danh mục
    if (selectedProduct) {
      reset({
        name: selectedProduct.name || '',
        description: selectedProduct.description || '',
        categoryId: selectedProduct.categoryId._id || '',
        brand: selectedProduct.brand || '',
        variants:
          selectedProduct.variants.length > 0
            ? selectedProduct.variants.map((v) => ({ ...v }))
            : [{ sku: '', size: '', color: '', price: 0, discountPrice: null, stock: 0, images: [] }],
        images: selectedProduct.images.map((url) => ({ url })) || [],
        tags: selectedProduct.tags || [],
        isActive: selectedProduct.isActive ?? true
      });
    } else {
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
  }, [selectedProduct, reset]);

  const onSubmit = async (data) => {
    console.log('data', data);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('categoryId', data.categoryId);
    formData.append('brand', data.brand);
    formData.append('isActive', data.isActive);
    data.tags.forEach((tag) => formData.append('tags[]', tag));

    // Xử lý images của product
    data.images.forEach((file) => {
      if (file.originFileObj) formData.append('images', file.originFileObj);
    });

    // Xử lý variants
    data.variants.forEach((variant, index) => {
      formData.append(`variants[${index}][sku]`, variant.sku);
      formData.append(`variants[${index}][size]`, variant.size);
      formData.append(`variants[${index}][color]`, variant.color);
      formData.append(`variants[${index}][price]`, variant.price);
      if (variant.discountPrice) formData.append(`variants[${index}][discountPrice]`, variant.discountPrice);
      formData.append(`variants[${index}][stock]`, variant.stock);
      variant.images.forEach((file) => {
        if (file.originFileObj) formData.append(`images`, file.originFileObj);
      });
    });
    // Xác định ảnh đã xoá (chỉ khi edit)
    if (selectedProduct?.images?.length > 0) {
      const oldImages = selectedProduct.images; // ['https://res.cloudinary.com/abc.jpg', ...]
      const currentImages = data.images
        .filter((img) => !img.originFileObj) // chỉ lấy ảnh cũ còn lại
        .map((img) => img.url);

      let deletedImages = oldImages.filter((url) => !currentImages.includes(url));
      deletedImages.forEach((url) => formData.append('deletedImages[]', url));
    }
    try {
      if (selectedProduct) {
        for (let pair of formData.entries()) {
          console.log(pair[0] + ':', pair[1]);
        }

        // Chỉnh sửa category
        const response = await dispatch(updateProductById({ productId: selectedProduct._id, payload: formData }));
        console.log('sau dispacth chinh sửa', response);
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        // for (let pair of formData.entries()) {
        //   console.log(pair[0] + ':', pair[1]);
        // }
        // Thêm mới category
        const response = await dispatch(handleCreateProduct(formData));
        message.success('Thêm sản phẩm thành công!');
      }
      // dispatch(fetchProducts({ page: 1, limit: 10 }));
      // dispatch(setIsOpenForm(false));
    } catch (error) {
      console.error('Error:', error);
      message.error('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  return (
    <Modal
      width={800}
      open={isOpenForm}
      title={selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
      okText={selectedProduct ? 'Cập nhật' : 'Tạo mới'}
      cancelText='Hủy'
      okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
      onCancel={() => dispatch(setIsOpenForm(false))}
      destroyOnClose
      onOk={handleSubmit(onSubmit)}
      confirmLoading={status === 'loading'}
      className='font-robotoMono'
      // footer={[
      //   <Button key='cancel' icon={<CloseOutlined />}>
      //     Huỷ
      //   </Button>,
      //   <Button key='confirm' type='primary' icon={<CheckCircleOutlined />}>
      //     Xác nhận
      //   </Button>
      // ]}
    >
      <Form layout='vertical' onFinish={handleSubmit(onSubmit)}>
        <Form.Item label='Tên sản phẩm' help={errors.name?.message} validateStatus={errors.name ? 'error' : ''}>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                bordered={false}
                onChange={(value) => field.onChange(value)}
                placeholder='Nhập tên sản phẩm'
              />
            )}
          />
        </Form.Item>

        <Form.Item label='Danh mục' help={errors.categoryId?.message} validateStatus={errors.categoryId ? 'error' : ''}>
          <Controller
            name='categoryId'
            control={control}
            render={({ field }) => (
              <Select {...field} bordered={false} value={field.value || undefined} placeholder='Chọn danh mục'>
                {categories.map((cat) => (
                  <Option key={cat._id} value={cat._id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item label='Thương hiệu' help={errors.brand?.message} validateStatus={errors.brand ? 'error' : ''}>
          <Controller
            name='brand'
            control={control}
            render={({ field }) => <Input {...field} bordered={false} placeholder='Nhập thương hiệu' />}
          />
        </Form.Item>

        <Form.Item label='Mô tả' help={errors.description?.message} validateStatus={errors.description ? 'error' : ''}>
          <Controller
            name='description'
            control={control}
            render={({ field }) => <Input.TextArea {...field} bordered={false} placeholder='Nhập mô tả' rows={3} />}
          />
        </Form.Item>

        <Form.Item label='Ảnh sản phẩm' help={errors.images?.message} validateStatus={errors.images ? 'error' : ''}>
          <Controller
            name='images'
            control={control}
            render={({ field }) => {
              const handleChange = ({ fileList }) => {
                // Gắn preview url nếu là file mới (chưa có url)
                const newFileList = fileList.map((file) => {
                  if (!file.url && !file.preview && file.originFileObj) {
                    file.preview = URL.createObjectURL(file.originFileObj);
                  }
                  return file;
                });
                field.onChange(newFileList);
              };

              return (
                <Upload
                  multiple
                  listType='picture-card' // Hiển thị ảnh thumbnail
                  beforeUpload={() => false} // Không tự động upload
                  fileList={field.value}
                  onChange={handleChange}
                  onPreview={(file) => {
                    const src = file.url || file.preview;
                    const imgWindow = window.open(src);
                    imgWindow?.document.write(`<img src="${src}" />`);
                  }}
                >
                  {field?.value?.length < 8 && ( // Giới hạn tối đa 8 ảnh
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                    </div>
                  )}
                </Upload>
              );
            }}
          />
        </Form.Item>

        {/* Variants */}
        <Form.Item label='Biến thể' help={errors.variants?.message} validateStatus={errors.variants ? 'error' : ''}>
          {variantFields.map((field, index) => (
            <Card key={field.id} style={{ marginBottom: 16 }}>
              <Form.Item label='SKU' help={errors.variants?.[index]?.sku?.message}>
                <Controller
                  name={`variants[${index}].sku`}
                  control={control}
                  render={({ field }) => <Input {...field} bordered={false} placeholder='Nhập SKU' />}
                />
              </Form.Item>
              <Form.Item label='Kích thước' help={errors.variants?.[index]?.size?.message}>
                <Controller
                  name={`variants[${index}].size`}
                  control={control}
                  render={({ field }) => <Input {...field} bordered={false} placeholder='Nhập kích thước' />}
                />
              </Form.Item>
              <Form.Item label='Màu sắc' help={errors.variants?.[index]?.color?.message}>
                <Controller
                  name={`variants[${index}].color`}
                  control={control}
                  render={({ field }) => <Input {...field} bordered={false} placeholder='Nhập màu sắc' />}
                />
              </Form.Item>
              <Form.Item label='Giá' help={errors.variants?.[index]?.price?.message}>
                <Controller
                  name={`variants[${index}].price`}
                  control={control}
                  render={({ field }) => <Input type='number' {...field} placeholder='Nhập giá' />}
                />
              </Form.Item>
              <Form.Item label='Giá giảm giá' help={errors.variants?.[index]?.discountPrice?.message}>
                <Controller
                  name={`variants[${index}].discountPrice`}
                  control={control}
                  render={({ field }) => <Input type='number' {...field} placeholder='Nhập giá giảm (nếu có)' />}
                />
              </Form.Item>
              <Form.Item label='Số lượng' help={errors.variants?.[index]?.stock?.message}>
                <Controller
                  name={`variants[${index}].stock`}
                  control={control}
                  render={({ field }) => <Input type='number' {...field} placeholder='Nhập số lượng' />}
                />
              </Form.Item>
              <Form.Item label='Ảnh biến thể' help={errors.variants?.[index]?.images?.message}>
                <Controller
                  name={`variants[${index}].images`}
                  control={control}
                  render={({ field }) => (
                    <Upload
                      multiple
                      beforeUpload={() => false}
                      fileList={field.value}
                      onChange={({ fileList }) => field.onChange(fileList)}
                    >
                      <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                  )}
                />
              </Form.Item>
              {variantFields.length > 1 && (
                <Button type='link' danger onClick={() => removeVariant(index)}>
                  Xóa biến thể
                </Button>
              )}
            </Card>
          ))}
          <Button
            type='dashed'
            onClick={() =>
              appendVariant({ sku: '', size: '', color: '', price: 0, discountPrice: null, stock: 0, images: [] })
            }
          >
            Thêm biến thể
          </Button>
        </Form.Item>

        <Form.Item label='Tags'>
          <Controller
            name='tags'
            control={control}
            render={({ field }) => <Select mode='tags' {...field} placeholder='Nhập tags (ấn Enter để thêm)' />}
          />
        </Form.Item>

        <Form.Item label='Trạng thái hoạt động'>
          <Controller
            name='isActive'
            control={control}
            render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;
