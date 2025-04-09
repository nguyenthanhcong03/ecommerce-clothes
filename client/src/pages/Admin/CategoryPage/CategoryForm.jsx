import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form, Input, Button, Switch, Modal, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  handleCreateCategory,
  setIsOpenForm,
  updateCategoryById
} from '../../../redux/features/category/categorySlice';

const { Option } = Select;

// Schema validation với Yup
const categorySchema = yup.object({
  name: yup.string().required('Tên danh mục là bắt buộc').trim(),
  parentId: yup.string().nullable().default(null),
  description: yup.string().trim().optional(),
  image: yup.string().url('URL ảnh không hợp lệ').optional(),
  isActive: yup.boolean().default(true),
  priority: yup.number().default(0).min(0, 'Ưu tiên phải là số không âm')
});

const CategoryForm = () => {
  const dispatch = useDispatch();
  const { categories, status, error, page, pages, total, isOpenForm, selectedCategory } = useSelector(
    (state) => state.category
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: '',
      parentId: null,
      description: '',
      image: '',
      isActive: true,
      priority: 0
    }
  });

  // Điền dữ liệu khi chỉnh sửa
  useEffect(() => {
    if (selectedCategory) {
      reset({
        name: selectedCategory.name || '',
        parentId: selectedCategory.parentId || null,
        description: selectedCategory.description || '',
        image: selectedCategory.image || '',
        isActive: selectedCategory.isActive ?? true,
        priority: selectedCategory.priority || 0
      });
    } else {
      reset({
        name: '',
        parentId: null,
        description: '',
        image: '',
        isActive: true,
        priority: 0
      });
    }
  }, [selectedCategory, reset]);

  const onSubmit = async (data) => {
    try {
      if (selectedCategory) {
        console.log('selectedCategory', selectedCategory);
        // Chỉnh sửa category
        const response = await dispatch(updateCategoryById({ categoryId: selectedCategory._id, payload: data }));
        // await axios.put(`http://localhost:3000/api/categories/${selectedCategory._id}`, data);
        console.log('Category updated:', response);
      } else {
        // Thêm mới category
        const response = await dispatch(handleCreateCategory({ payload: data }));
        console.log('Category created 1:', response);
        // await axios.post('http://localhost:3000/api/categories', data);
        console.log('Category created 2:', data);
      }
      dispatch(fetchCategories()); // Gọi callback để cập nhật danh sách
      dispatch(setIsOpenForm(false)); // Đóng modal
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra khi xử lý danh mục.');
    }
  };

  return (
    <Modal
      width={600}
      open={isOpenForm}
      title={selectedCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      okText={selectedCategory ? 'Cập nhật' : 'Tạo mới'}
      cancelText='Hủy'
      okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
      onCancel={() => dispatch(setIsOpenForm(false))}
      destroyOnClose
      onOk={handleSubmit(onSubmit)}
    >
      <Form layout='vertical' onFinish={handleSubmit(onSubmit)}>
        <Form.Item label='Tên danh mục' help={errors.name?.message} validateStatus={errors.name ? 'error' : ''}>
          <Controller
            name='name'
            control={control}
            render={({ field }) => <Input {...field} placeholder='Nhập tên danh mục' />}
          />
        </Form.Item>

        <Form.Item label='Danh mục cha'>
          <Controller
            name='parentId'
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder='Chọn danh mục cha' allowClear>
                {categories
                  .filter((cat) => cat._id !== selectedCategory?._id) // Loại bỏ chính nó khỏi danh sách
                  .map((cat) => (
                    <Option key={cat._id} value={cat._id}>
                      {cat.name}
                    </Option>
                  ))}
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item label='Mô tả' help={errors.description?.message} validateStatus={errors.description ? 'error' : ''}>
          <Controller
            name='description'
            control={control}
            render={({ field }) => <Input.TextArea {...field} placeholder='Nhập mô tả' rows={3} />}
          />
        </Form.Item>

        <Form.Item label='URL ảnh' help={errors.image?.message} validateStatus={errors.image ? 'error' : ''}>
          <Controller
            name='image'
            control={control}
            render={({ field }) => <Input {...field} placeholder='Nhập URL ảnh' />}
          />
        </Form.Item>

        <Form.Item label='Trạng thái hoạt động'>
          <Controller
            name='isActive'
            control={control}
            render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
          />
        </Form.Item>

        <Form.Item label='Ưu tiên' help={errors.priority?.message} validateStatus={errors.priority ? 'error' : ''}>
          <Controller
            name='priority'
            control={control}
            render={({ field }) => <Input type='number' {...field} placeholder='Nhập mức ưu tiên' />}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryForm;
