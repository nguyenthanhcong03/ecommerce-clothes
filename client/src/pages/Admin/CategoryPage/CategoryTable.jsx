import Button from '@/components/common/Button/Button';
import { fetchCategories, setIsOpenForm, setSelectedCategory } from '@/redux/features/category/categorySlice';
import { buildTree } from '@/utils/convertFlatArrToTreeArr';
import { Image, Popconfirm, Space, Table, Tag } from 'antd';
import axios from 'axios';
import { Icon, Minus, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CategoryForm from './CategoryForm';

const CategoryTable = () => {
  const dispatch = useDispatch();
  const { categories, status, error, page, pages, total, isOpenForm, selectedCategory } = useSelector(
    (state) => state.category
  );
  console.log('tree', buildTree(categories));

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Xóa category
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/categories/${id}`);
      fetchCategories(); // Cập nhật lại danh sách
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Mở form chỉnh sửa
  const handleEdit = (category) => {
    dispatch(setSelectedCategory(category));
    dispatch(setIsOpenForm(true));
  };

  // Mở form thêm mới
  const handleAdd = () => {
    dispatch(setSelectedCategory(null));
    dispatch(setIsOpenForm(true));
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'images',
      key: 'images',
      align: 'center',
      width: 200,
      render: (images) => (
        <Image.PreviewGroup>
          {images &&
            images
              .slice(0, 2)
              .map((img, index) => (
                <Image key={index} width={40} height={40} src={img} style={{ objectFit: 'cover', marginRight: 4 }} />
              ))}
        </Image.PreviewGroup>
      )
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      align: 'left',
      width: 250
    },
    {
      title: 'Mô tả',
      align: 'left',
      className: 'description-header',
      render: (_, record) => {
        const description = record.description || 'Chưa có mô tả';
        return <div className='text-left'>{description}</div>;
      },
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      align: 'center',
      key: 'isActive',
      render: (isActive) =>
        isActive ? <Tag color={'green'}>Hoạt động</Tag> : <Tag color={'green'}>Không hoạt động</Tag>
    },
    {
      title: 'Hành động',
      align: 'center',
      key: 'action',
      fixed: 'right',
      width: 110,
      render: (_, record) => (
        <Space
          size='middle'
          style={{
            justifyContent: 'center', // Căn giữa nội dung trong Space
            display: 'flex' // Đảm bảo Space hoạt động như flex container
          }}
        >
          <div className='cursor-pointer rounded-[5px] bg-[#0961FF] p-1'>
            <Pencil strokeWidth={1.5} width={16} height={16} onClick={() => handleEdit(record)} color='#fff' />
          </div>
          <Popconfirm
            title='Bạn có chắc muốn xóa danh mục này?'
            onConfirm={() => handleDelete(record._id)}
            okText='Có'
            cancelText='Không'
            placement='topRight'
            okButtonProps={{
              style: { backgroundColor: '#333', borderColor: '#333', color: 'white' }
            }}
            cancelButtonProps={{
              style: { color: 'gray', borderColor: 'gray' }
            }}
            // icon={
            //   <div className='rounded-full bg-yellow-400 p-1'>
            //     <FiAlertTriangle color='#fff' size={10} />
            //   </div>
            // }
          >
            <div className='cursor-pointer rounded-[5px] bg-[#DE2E3D] p-1'>
              <Trash2 strokeWidth={1.5} width={16} height={16} color='#fff' />
            </div>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Button onClick={handleAdd}>Thêm danh mục mới</Button>
      <Table
        bordered
        scroll={{ x: 'max-content' }}
        rowKey='_id'
        // rowSelection={rowSelection}
        columns={columns}
        dataSource={buildTree(categories)}
        pagination={{ pageSize: 5, position: ['bottomCenter'] }}
        // rowClassName={(record, index) => (index % 2 !== 0 ? 'bg-[#fafafa]' : 'bg-white')}
        locale={{ emptyText: status === 'loading' ? 'Đang tải dữ liệu...' : 'Không có dữ liệu' }}
        title={() => (
          <div className='flex flex-col items-center justify-between rounded-t-lg lg:flex-row'>
            <h3 className='text-xl font-bold'>Danh sách danh mục</h3>
            <div className='flex items-center gap-2'>{/* <Input placeholder='Tìm kiếm sản phẩm' /> */}</div>
          </div>
        )}
      />
      <CategoryForm />
    </div>
  );
};

export default CategoryTable;
