import React, { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Input, Button, Switch, Modal, Select, Card, Row, Col, Space } from 'antd';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, setIsOpenForm } from '../../../redux/features/product/productSlice';
import { fetchCategories } from '../../../redux/features/category/categorySlice';

const { Option } = Select;

// Schema validation với Yup
const variantSchema = yup.object({
  sku: yup.string().required('SKU là bắt buộc').trim(),
  size: yup.string().required('Kích thước là bắt buộc'),
  color: yup.string().required('Màu sắc là bắt buộc'),
  price: yup.number().required('Giá là bắt buộc').min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  discountPrice: yup.number().nullable().min(0, 'Giá giảm phải lớn hơn hoặc bằng 0'),
  stock: yup.number().required('Số lượng tồn kho là bắt buộc').min(0, 'Số lượng phải lớn hơn hoặc bằng 0'),
  images: yup.array().of(yup.string().url('URL ảnh không hợp lệ'))
});

const productSchema = yup.object({
  name: yup.string().required('Tên sản phẩm là bắt buộc').trim(),
  slug: yup.string().required('Slug là bắt buộc').trim(),
  description: yup.string().optional(),
  categoryId: yup.string().required('Danh mục là bắt buộc'),
  brand: yup.string().required('Thương hiệu là bắt buộc'),
  variants: yup.array().of(variantSchema).min(1, 'Phải có ít nhất một biến thể'),
  images: yup.array().of(yup.string().url('URL ảnh không hợp lệ')),
  tags: yup.array().of(yup.string()),
  isActive: yup.boolean().default(true)
});

const ProductForm = () => {
  const dispatch = useDispatch();
  const { categories, selectedCategory } = useSelector((state) => state.category);
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
      slug: '',
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
    dispatch(fetchCategories());
    if (selectedProduct) {
      reset({
        name: selectedProduct.name || '',
        slug: selectedProduct.slug || '',
        description: selectedProduct.description || '',
        categoryId: selectedProduct.categoryId || '',
        brand: selectedProduct.brand || '',
        variants:
          selectedProduct.variants.length > 0
            ? selectedProduct.variants
            : [{ sku: '', size: '', color: '', price: 0, discountPrice: null, stock: 0, images: [] }],
        images: selectedProduct.images || [],
        tags: selectedProduct.tags || [],
        isActive: selectedProduct.isActive ?? true
      });
    } else {
      reset({
        name: '',
        slug: '',
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
    try {
      console.log('data', data);
      // if (selectedProduct) {
      //   console.log('selectedProduct', selectedProduct);
      //   // Chỉnh sửa category
      //   const response = await dispatch(updateProductById({ categoryId: selectedProduct._id, payload: data }));
      //   // await axios.put(`http://localhost:3000/api/categories/${selectedProduct._id}`, data);
      //   console.log('Product updated:', response);
      // } else {
      //   // Thêm mới category
      //   const response = await dispatch(handleCreateProduct({ payload: data }));
      //   console.log('Category created 1:', response);
      //   // await axios.post('http://localhost:3000/api/categories', data);
      //   console.log('Category created 2:', data);
      // }
      // dispatch(fetchProducts({ page: 1, limit: 10 })); // Gọi callback để cập nhật danh sách
      // dispatch(setIsOpenForm(false)); // Đóng modal
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra khi xử lý danh mục.');
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
    >
      <Form layout='vertical' onFinish={handleSubmit(onSubmit)}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Tên sản phẩm' help={errors.name?.message} validateStatus={errors.name ? 'error' : ''}>
              <Controller
                name='name'
                control={control}
                render={({ field }) => <Input {...field} placeholder='Nhập tên sản phẩm' />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Slug' help={errors.slug?.message} validateStatus={errors.slug ? 'error' : ''}>
              <Controller
                name='slug'
                control={control}
                render={({ field }) => <Input {...field} placeholder='Nhập slug (ví dụ: san-pham-1)' />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label='Mô tả' help={errors.description?.message} validateStatus={errors.description ? 'error' : ''}>
          <Controller
            name='description'
            control={control}
            render={({ field }) => <Input.TextArea {...field} placeholder='Nhập mô tả' rows={3} />}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label='Danh mục'
              help={errors.categoryId?.message}
              validateStatus={errors.categoryId ? 'error' : ''}
            >
              <Controller
                name='categoryId'
                control={control}
                render={({ field }) => (
                  <Select {...field} placeholder='Chọn danh mục'>
                    {categories.map((cat) => (
                      <Option key={cat._id} value={cat._id}>
                        {cat.name}
                      </Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Thương hiệu' help={errors.brand?.message} validateStatus={errors.brand ? 'error' : ''}>
              <Controller
                name='brand'
                control={control}
                render={({ field }) => <Input {...field} placeholder='Nhập thương hiệu' />}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Variants */}
        <Form.Item label='Biến thể' help={errors.variants?.message} validateStatus={errors.variants ? 'error' : ''}>
          {variantFields.map((field, index) => (
            <Card key={field.id} title={`Biến thể ${index + 1}`} style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label='SKU' help={errors.variants?.[index]?.sku?.message}>
                    <Controller
                      name={`variants[${index}].sku`}
                      control={control}
                      render={({ field }) => <Input {...field} placeholder='Nhập SKU' />}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label='Kích thước' help={errors.variants?.[index]?.size?.message}>
                    <Controller
                      name={`variants[${index}].size`}
                      control={control}
                      render={({ field }) => <Input {...field} placeholder='Nhập kích thước' />}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label='Màu sắc' help={errors.variants?.[index]?.color?.message}>
                    <Controller
                      name={`variants[${index}].color`}
                      control={control}
                      render={({ field }) => <Input {...field} placeholder='Nhập màu sắc' />}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label='Giá' help={errors.variants?.[index]?.price?.message}>
                    <Controller
                      name={`variants[${index}].price`}
                      control={control}
                      render={({ field }) => <Input type='number' {...field} placeholder='Nhập giá' />}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label='Giá giảm' help={errors.variants?.[index]?.discountPrice?.message}>
                    <Controller
                      name={`variants[${index}].discountPrice`}
                      control={control}
                      render={({ field }) => <Input type='number' {...field} placeholder='Nhập giá giảm (nếu có)' />}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label='Tồn kho' help={errors.variants?.[index]?.stock?.message}>
                    <Controller
                      name={`variants[${index}].stock`}
                      control={control}
                      render={({ field }) => <Input type='number' {...field} placeholder='Nhập số lượng tồn kho' />}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label='Ảnh biến thể'>
                <Controller
                  name={`variants[${index}].images`}
                  control={control}
                  render={({ field }) => (
                    <Input.TextArea
                      {...field}
                      value={field.value.join('\n')}
                      onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                      placeholder='Nhập URL ảnh (mỗi dòng một URL)'
                    />
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

        <Form.Item label='Ảnh sản phẩm' help={errors.images?.message} validateStatus={errors.images ? 'error' : ''}>
          <Controller
            name='images'
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                value={field.value.join('\n')}
                onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                placeholder='Nhập URL ảnh (mỗi dòng một URL)'
              />
            )}
          />
        </Form.Item>

        <Form.Item label='Tags'>
          <Controller
            name='tags'
            control={control}
            render={({ field }) => <Select {...field} mode='tags' placeholder='Nhập tags' style={{ width: '100%' }} />}
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
