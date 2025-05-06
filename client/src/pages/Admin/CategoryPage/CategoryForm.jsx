import { deleteMultipleFiles, uploadMultipleFiles } from '@/services/fileService';
import { createCategory, updateCategoryById } from '@/store/slices/categorySlice';
import { buildTree } from '@/utils/convertFlatArrToTreeArr';
import { UploadOutlined } from '@ant-design/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form, Input, message, Modal, Switch, TreeSelect, Upload } from 'antd';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as yup from 'yup';

// Định nghĩa schema xác thực cho form danh mục sử dụng Yup
const categorySchema = yup.object({
  name: yup.string().required('Tên danh mục là bắt buộc').trim(),
  parentId: yup.string().nullable().default(null),
  description: yup.string().trim().optional(),
  images: yup.array().of(yup.mixed()).min(1, 'Phải chọn ít nhất một ảnh'),
  isActive: yup.boolean().default(true),
  priority: yup.number().default(0).min(0, 'Ưu tiên phải là số không âm')
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
    imgWindow?.document.write(`<img src="${src}" />`);
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

const CategoryForm = ({ categories, loading, selectedCategory, onClose }) => {
  console.log('form');
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false); // Trạng thái đang tải file
  const [localFiles, setLocalFiles] = useState([]); // Lưu trữ danh sách file mới

  // Tối ưu hóa việc tìm tất cả ID con bằng useMemo
  const allChildIds = useMemo(() => {
    if (!selectedCategory) return [];

    // Hàm đệ quy để tìm tất cả ID con
    const findAllChildIds = (categoryId) => {
      const directChildren = categories.filter((cat) => cat.parentId === categoryId).map((cat) => cat._id);
      const allChildren = [...directChildren];

      directChildren.forEach((childId) => {
        allChildren.push(...findAllChildIds(childId));
      });

      return allChildren;
    };

    // Chỉ tính toán khi selectedCategory thay đổi
    return findAllChildIds(selectedCategory._id);
  }, [categories, selectedCategory]);

  // Logic để lọc các danh mục hợp lệ làm danh mục cha
  const filteredCategories = useMemo(() => {
    // Nếu đang thêm mới, sử dụng tất cả danh mục
    if (!selectedCategory) return categories;

    // Loại bỏ danh mục hiện tại và tất cả danh mục con của nó
    return categories.filter((cat) => cat._id !== selectedCategory._id && !allChildIds.includes(cat._id));
  }, [categories, selectedCategory, allChildIds]);

  // Chuyển đổi danh mục đã lọc thành cấu trúc cây cho TreeSelect - sử dụng useMemo
  const categoriesArray = useMemo(() => {
    const treeData = buildTree(filteredCategories);
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
  }, [filteredCategories]);

  // Khởi tạo React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: '',
      parentId: null,
      description: '',
      images: [],
      isActive: true,
      priority: 0
    }
  });

  // Khởi tạo giá trị form khi chỉnh sửa
  useEffect(() => {
    if (selectedCategory) {
      // Điền thông tin danh mục được chọn vào form
      reset({
        name: selectedCategory?.name || '',
        parentId: selectedCategory?.parentId || null,
        description: selectedCategory?.description || '',
        images: selectedCategory?.images || [],
        isActive: selectedCategory?.isActive ?? true,
        priority: selectedCategory?.priority || 0
      });
      // Không gọi setLocalFiles ở đây để tránh render thừa
    } else {
      // Khởi tạo form trống khi thêm mới danh mục
      reset({
        name: '',
        parentId: null,
        description: '',
        images: [],
        isActive: true,
        priority: 0
      });
    }
    // Chỉ gọi setLocalFiles một lần sau khi reset form
    setLocalFiles([]);
  }, [selectedCategory, reset]);

  // Theo dõi thay đổi hình ảnh để xử lý file cục bộ
  const images = watch('images');
  useEffect(() => {
    if (!images?.length) return;

    // Lọc ra những file mới (có thuộc tính originFileObj)
    const newLocalFiles = images.filter((file) => file.originFileObj);

    // Tránh so sánh phức tạp và chỉ cập nhật khi cần thiết
    const hasChanges =
      newLocalFiles.length !== localFiles.length || newLocalFiles.some((file, i) => localFiles[i]?.uid !== file.uid);

    if (hasChanges) {
      setLocalFiles(newLocalFiles);
    }
  }, [images]); // Loại bỏ localFiles khỏi dependencies

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

  // Thêm danh mục mới
  const handleAddCategory = useCallback(
    async (formData) => {
      const resultAction = await dispatch(createCategory(formData));
      if (createCategory.fulfilled.match(resultAction)) {
        message.success('Thêm danh mục thành công!');
      } else if (createCategory.rejected.match(resultAction)) {
        message.error(resultAction.payload || 'Có lỗi xảy ra khi thêm danh mục');
      }
    },
    [dispatch] // dispatch là ổn định
  );

  // Cập nhật danh mục hiện có
  const handleUpdateCategory = useCallback(
    async (formData) => {
      if (!selectedCategory?._id) return;

      const resultAction = await dispatch(updateCategoryById({ categoryId: selectedCategory._id, payload: formData }));
      if (updateCategoryById.fulfilled.match(resultAction)) {
        message.success('Cập nhật danh mục thành công!');
      } else if (updateCategoryById.rejected.match(resultAction)) {
        message.error(resultAction.payload || 'Có lỗi xảy ra khi cập nhật danh mục');
      }
    },
    [dispatch, selectedCategory?._id] // Chỉ phụ thuộc vào ID
  );

  // Xử lý gửi form
  const onSubmit = useCallback(
    async (data) => {
      try {
        setUploading(true);

        // Xử lý hình ảnh - tải lên cái mới, giữ lại cái cũ
        let processedImages = [...data.images];
        if (localFiles.length > 0) {
          // Kết hợp hình ảnh cũ (không có originFileObj) với hình ảnh mới (có originFileObj)
          const combinedFiles = [...data.images.filter((img) => !img.originFileObj), ...localFiles];
          processedImages = await uploadFiles(combinedFiles);
        }

        // Chuẩn bị dữ liệu để gửi
        const formData = {
          name: data.name,
          description: data.description || '',
          parentId: data.parentId || null,
          priority: data.priority,
          isActive: data.isActive,
          images: processedImages.map((file) => (typeof file === 'string' ? file : file.url))
        };

        // Xử lý xóa hình ảnh khi cập nhật
        if (selectedCategory) {
          const oldImages = selectedCategory.images;
          const currentImageUrls = processedImages.map((img) => (typeof img === 'string' ? img : img.url));
          const deletedImages = oldImages.filter((img) => !currentImageUrls.includes(img));

          if (deletedImages.length > 0) {
            try {
              await deleteMultipleFiles(deletedImages.map((img) => img.public_id || img));
            } catch (deleteErr) {
              console.error('Lỗi khi xóa ảnh:', deleteErr);
            }
          }

          await handleUpdateCategory(formData);
        } else {
          await handleAddCategory(formData);
        }

        // Đặt lại local files sau khi gửi thành công
        setLocalFiles([]);
        onClose(); // Đóng form sau khi hoàn tất
      } catch (error) {
        console.error('Error:', error);
        message.error('Có lỗi xảy ra khi xử lý danh mục.');
      } finally {
        setUploading(false);
      }
    },
    [localFiles, selectedCategory, handleUpdateCategory, handleAddCategory, uploadFiles, onClose]
    // Loại bỏ dispatch từ dependencies
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
      onClose(); // Đóng form mà không cần xác nhận
      setLocalFiles([]);
    }
  }, [isDirty, localFiles.length, onClose]);

  return (
    <Modal
      width={600}
      open={true}
      title={selectedCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      okText={selectedCategory ? 'Cập nhật' : 'Tạo mới'}
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
        {/* Trường nhập tên danh mục */}
        <Form.Item
          label='Tên danh mục'
          help={errors.name?.message}
          validateStatus={errors.name ? 'error' : ''}
          required
        >
          <Controller
            name='name'
            control={control}
            render={({ field }) => <Input {...field} placeholder='Nhập tên danh mục' disabled={uploading || loading} />}
          />
        </Form.Item>

        {/* Trường chọn danh mục cha */}
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
          label='Ảnh danh mục'
          help={errors.images?.message}
          validateStatus={errors.images ? 'error' : ''}
          required
          tooltip='Tải lên ít nhất một ảnh đại diện cho danh mục'
        >
          <Controller
            name='images'
            control={control}
            render={({ field }) => (
              <ImageUpload value={field.value} onChange={field.onChange} disabled={uploading || loading} />
            )}
          />
        </Form.Item>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* Trường bật/tắt trạng thái hoạt động */}
          <Form.Item label='Trạng thái hoạt động'>
            <Controller
              name='isActive'
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={uploading || loading}
                  checkedChildren='Hoạt động'
                  unCheckedChildren='Không hoạt động'
                />
              )}
            />
          </Form.Item>

          {/* Trường nhập mức độ ưu tiên */}
          <Form.Item
            label='Ưu tiên'
            help={errors.priority?.message}
            validateStatus={errors.priority ? 'error' : ''}
            tooltip='Giá trị cao sẽ hiển thị trước'
          >
            <Controller
              name='priority'
              control={control}
              render={({ field }) => (
                <Input
                  type='number'
                  {...field}
                  placeholder='Nhập mức ưu tiên'
                  min={0}
                  disabled={uploading || loading}
                />
              )}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default memo(CategoryForm);
