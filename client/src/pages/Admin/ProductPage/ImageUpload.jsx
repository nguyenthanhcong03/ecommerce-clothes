import { UploadOutlined } from '@ant-design/icons';
import { Image, Upload } from 'antd';
import PropTypes from 'prop-types';
import { useState } from 'react';

const ImageUpload = ({ value = [], onChange, disabled, maxImages = 8 }) => {
  // State for Antd Image preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const handleChange = ({ fileList }) => {
    // Giới hạn tối đa số ảnh theo prop maxImages
    const limitedFileList = fileList.slice(0, maxImages);

    // Xử lý xem trước cho các file mới
    const newFileList = limitedFileList.map((file) => {
      if (!file.url && !file.preview && file.originFileObj) {
        file.preview = URL.createObjectURL(file.originFileObj);
      }
      return file;
    });

    onChange(newFileList);
  };
  const onPreview = async (file) => {
    const src = file.url || file.preview;
    setPreviewImage(src);
    setPreviewOpen(true);
    setPreviewTitle(file.name || (file.url && file.url.split('/').pop()) || '');
  };

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
    <div>
      <p style={{ marginBottom: 8, color: '#666' }}>Tối đa {maxImages} ảnh</p>
      <Upload
        multiple
        listType='picture-card'
        beforeUpload={() => false} // Không tải lên ngay lập tức
        fileList={fileList}
        onChange={handleChange}
        onPreview={onPreview}
        disabled={disabled}
      >
        {value?.length < maxImages && !disabled && (
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Chọn ảnh</div>
          </div>
        )}
      </Upload>
      {/* Antd Image Preview */}
      <div style={{ display: 'none' }}>
        <Image
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            title: previewTitle
          }}
          src={previewImage}
        />
      </div>
    </div>
  );
};

// Prop types validation
ImageUpload.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  maxImages: PropTypes.number
};

export default ImageUpload;
