import { UploadOutlined } from '@ant-design/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form, Input, message, Modal, Select, Switch, TreeSelect, Upload } from 'antd';
import React, { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import {
  fetchCategories,
  handleCreateCategory,
  setIsOpenForm,
  updateCategoryById
} from '../../../redux/features/category/categorySlice';
import { buildTree } from '../../../utils/convertFlatArrToTreeArr';

const { Option } = Select;

// Schema validation với Yup
const categorySchema = yup.object({
  name: yup.string().required('Tên danh mục là bắt buộc').trim(),
  parentId: yup.string().nullable().default(null),
  description: yup.string().trim().optional(),
  images: yup.array().of(yup.mixed()).min(1, 'Phải chọn ít nhất một ảnh'),
  isActive: yup.boolean().default(true),
  priority: yup.number().default(0).min(0, 'Ưu tiên phải là số không âm')
});

const CategoryForm = () => {
  const dispatch = useDispatch();
  const { categories, status, error, page, pages, total, isOpenForm, selectedCategory } = useSelector(
    (state) => state.category
  );

  // Lọc ra các danh mục có thể là cha của danh mục hiện tại (loại bỏ chính nó và các danh mục con của nó)
  const getFilteredCategories = () => {
    // Nếu đang thêm mới, sử dụng tất cả danh mục
    if (!selectedCategory) return categories;

    // Hàm đệ quy để tìm tất cả ID của danh mục con
    const findAllChildIds = (categoryId) => {
      const directChildren = categories.filter((cat) => cat.parentId === categoryId).map((cat) => cat._id);
      const allChildren = [...directChildren];

      directChildren.forEach((childId) => {
        allChildren.push(...findAllChildIds(childId));
      });

      return allChildren;
    };

    // Tìm tất cả ID của danh mục con
    const childIds = findAllChildIds(selectedCategory._id);

    // Loại bỏ chính nó và tất cả con của nó
    return categories.filter((cat) => cat._id !== selectedCategory._id && !childIds.includes(cat._id));
  };

  const treeData = buildTree(getFilteredCategories()); // Chuyển đổi danh sách phẳng thành cây cha con
  const categoriesArray = treeData.map((item) => ({
    title: item.name,
    value: item._id,
    children: item?.children?.map((child) => ({
      title: child.name,
      value: child._id
    }))
  }));

  console.log('categoriesArray', categoriesArray);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: selectedCategory?.name || '',
      parentId: selectedCategory?.parentId || null,
      description: selectedCategory?.description || '',
      images: selectedCategory?.images || [],
      isActive: selectedCategory?.isActive ?? true,
      priority: selectedCategory?.priority || 0
    }
  });

  // Điền dữ liệu khi chỉnh sửa
  useEffect(() => {
    if (selectedCategory) {
      reset({
        name: selectedCategory?.name || '',
        parentId: selectedCategory?.parentId || null,
        description: selectedCategory?.description || '',
        images: selectedCategory?.images.map((url) => ({ url })) || [],
        isActive: selectedCategory?.isActive ?? true,
        priority: selectedCategory?.priority || 0
      });
    } else {
      reset({
        name: '',
        parentId: null,
        description: '',
        images: [],
        isActive: true,
        priority: 0
      });
    }
  }, [selectedCategory, reset]);

  const onSubmit = async (data) => {
    console.log('data', data);
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('parentId', data.parentId);
    formData.append('priority', data.priority);
    formData.append('isActive', data.isActive);

    // Xử lý images của category
    data.images.forEach((file) => {
      if (file.originFileObj) formData.append('images', file.originFileObj);
    });

    // Xác định ảnh đã xoá (chỉ khi edit)
    if (selectedCategory?.images?.length > 0) {
      const oldImages = selectedCategory.images; // ['https://res.cloudinary.com/abc.jpg', ...]
      const currentImages = data.images
        .filter((img) => !img.originFileObj) // chỉ lấy ảnh cũ còn lại
        .map((img) => img.url);

      let deletedImages = oldImages.filter((url) => !currentImages.includes(url));
      deletedImages.forEach((url) => formData.append('deletedImages[]', url));
    }

    try {
      if (selectedCategory) {
        for (let pair of formData.entries()) {
          console.log(pair[0] + ':', pair[1]);
        }
        // Chỉnh sửa category
        const response = await dispatch(updateCategoryById({ categoryId: selectedCategory._id, payload: formData }));
        message.success('Cập nhật danh mục thành công!');
      } else {
        for (let pair of formData.entries()) {
          console.log(pair[0] + ':', pair[1]);
        }
        // Thêm mới category
        const response = await dispatch(handleCreateCategory({ payload: formData }));
        message.success('Thêm danh mục thành công!');
      }
      // dispatch(fetchCategories({ page: 1, limit: 10 }));
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
              <TreeSelect
                {...field}
                style={{ width: '100%' }}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeData={categoriesArray}
                placeholder='Chọn danh mục cha'
                treeDefaultExpandAll
                allowClear
                onChange={(value) => field.onChange(value)} // Cập nhật giá trị khi chọn
              />
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

        <Form.Item label='Ảnh danh mục' help={errors.images?.message} validateStatus={errors.images ? 'error' : ''}>
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
