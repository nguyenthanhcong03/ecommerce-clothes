import ImageUpload from '@/pages/admin/ProductPage/ImageUpload';
import { deleteMultipleFilesAPI, uploadMultipleFilesAPI } from '@/services/fileService';
import { createCategory, updateCategoryById } from '@/store/slices/categorySlice';
import { buildTree } from '@/utils/helpers/buildTree';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form, Input, message, Modal, TreeSelect } from 'antd';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { use } from 'react';
import { getCategoriesTree } from '@/store/slices/adminCategorySlice';
import { se } from 'date-fns/locale';
import { convertToTreeSelectFormat } from '@/utils/helpers/fn';

// Định nghĩa schema xác thực cho form danh mục sử dụng Yup
const categorySchema = yup.object({
  name: yup.string().required('Tên danh mục là bắt buộc').trim(),
  parentId: yup.string().nullable().default(null),
  description: yup.string().trim().optional(),
  images: yup.array().of(yup.mixed()).min(1, 'Phải chọn ít nhất một ảnh')
});

const CategoryForm = ({ selectedCategory, onClose }) => {
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false); // Trạng thái đang tải file
  const [localFiles, setLocalFiles] = useState([]); // Lưu trữ danh sách file mới
  const { categoriesTree, loading } = useSelector((state) => state.category);

  const filteredCategories = categoriesTree.filter((cat) => cat._id !== selectedCategory?._id);

  const treeSelectData = convertToTreeSelectFormat(filteredCategories);

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
      images: []
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
        images: selectedCategory?.images || []
      });
      // Không gọi setLocalFiles ở đây để tránh render thừa
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
  }, [images, localFiles]); // Loại bỏ localFiles khỏi dependencies

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

      const response = await uploadMultipleFilesAPI(filesToUpload);

      if (!response.success) {
        throw new Error('Tải lên ảnh thất bại');
      }

      // Chuyển đổi kết quả tải lên thành định dạng phù hợp
      const uploadedFiles = response?.data?.detailedResults.map((file) => ({
        uid: file.public_id,
        name: file.public_id.split('/').pop(),
        status: 'done',
        url: file.url,
        public_id: file.public_id
      }));

      return uploadedFiles;
    } catch (error) {
      console.error('Error uploading files:', error);
      message.error('Tải lên ảnh thất bại: ' + error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

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
  const onSubmit = async (data) => {
    try {
      setUploading(true);

      // Xử lý hình ảnh - tải lên cái mới, giữ lại cái cũ
      let processedImages = [...data.images.filter((img) => !img.originFileObj)];
      if (localFiles.length > 0) {
        const imagesUpload = await uploadFiles(localFiles);
        processedImages.push(...imagesUpload);
      }

      // Chuẩn bị dữ liệu để gửi
      const formData = {
        name: data.name,
        description: data.description || '',
        parentId: data.parentId || null,
        images: processedImages.map((file) => (typeof file === 'string' ? file : file.url))
      };

      // Xử lý xóa hình ảnh khi cập nhật
      if (selectedCategory) {
        const oldImages = selectedCategory.images;
        const currentImageUrls = processedImages.map((img) => (typeof img === 'string' ? img : img.url));
        const deletedImages = oldImages.filter((img) => !currentImageUrls.includes(img));

        if (deletedImages.length > 0) {
          try {
            await deleteMultipleFilesAPI(deletedImages.map((img) => img.public_id || img));
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
      onClose();
    } catch (error) {
      console.error('Error:', error);
      message.error('Có lỗi xảy ra khi xử lý danh mục.');
    } finally {
      setUploading(false);
    }
  };

  // Loại bỏ dispatch từ dependencies

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
                treeData={treeSelectData}
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
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                disabled={uploading || loading}
                maxImages={1}
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// PropTypes validation
CategoryForm.propTypes = {
  categories: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  selectedCategory: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    parentId: PropTypes.string,
    description: PropTypes.string,
    images: PropTypes.array.isRequired
  }),
  onClose: PropTypes.func.isRequired
};

export default memo(CategoryForm);
