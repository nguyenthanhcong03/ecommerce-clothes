import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import { fetchCategories, setIsOpenForm, setSelectedCategory } from '@/redux/features/category/categorySlice';
import { buildTree } from '@/utils/convertFlatArrToTreeArr';
import { Image, Popconfirm, Space, Table, Tag } from 'antd';
import { createStyles } from 'antd-style';
import axios from 'axios';
import React, { useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import CategoryForm from './CategoryForm';

const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table-wrapper {
        border: 1px solid #000;
        border-radius: 8px;
        overflow: hidden;
        ${antCls}-table {
          ${antCls}-table-container {
            ${antCls}-table-body {
              scrollbar-width: thin;
              scrollbar-color: #ccc transparent;
              &::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }
              &::-webkit-scrollbar-thumb {
                background-color: #ccc;
                border-radius: 4px;
              }
              &::-webkit-scrollbar-track {
                background-color: transparent;
              }
            }
          }
        }
      }
      ${antCls}-table-thead > tr > th {
        background-color: #f5f5f5;
        font-weight: bold;
        text-align: center;
      }
      ${antCls}-table-tbody > tr > td {
        text-align: center;
      }
      ${antCls}-pagination {
        margin-top: 16px;
      }
    `
  };
});

const CategoryTable = () => {
  const { styles } = useStyle();
  const dispatch = useDispatch();
  const { categories, status, error, page, pages, total, isOpenForm, selectedCategory } = useSelector(
    (state) => state.category
  );

  // Lấy danh sách category từ backend

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
      render: (images) => (
        <Image.PreviewGroup>
          {images.slice(0, 2).map((img, index) => (
            <Image key={index} width={40} height={40} src={img} style={{ objectFit: 'cover', marginRight: 4 }} />
          ))}
        </Image.PreviewGroup>
      )
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Mô tả',
      align: 'center',
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
      title: 'Ưu tiên',
      align: 'center',
      dataIndex: 'priority',
      key: 'priority'
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
            title='Bạn có chắc muốn xóa sản phẩm này?'
            onConfirm={() => handleDelete(record._id)}
            okText='Có'
            cancelText='Không'
            placement='topRight'
            okButtonProps={{
              style: { backgroundColor: 'black', borderColor: 'black', color: 'white' }
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
        // className={styles.customTable}
        scroll={{ x: 'max-content' }}
        rowKey='_id'
        // rowSelection={rowSelection}
        columns={columns}
        dataSource={buildTree(categories)}
        pagination={{ pageSize: 5, position: ['bottomCenter'] }}
        // rowClassName={(record, index) => (index % 2 !== 0 ? 'bg-[#fafafa]' : 'bg-white')}
        // bordered
        locale={{ emptyText: status === 'loading' ? 'Đang tải dữ liệu...' : 'Không có dữ liệu' }}
        title={() => (
          <div className='flex flex-col items-center justify-between rounded-t-lg lg:flex-row'>
            <h3 className='text-xl font-bold'>Danh sách danh mục</h3>
            <div className='flex items-center gap-2'>
              <Input placeholder='Tìm kiếm sản phẩm' />
            </div>
          </div>
        )}
      />
      <CategoryForm />
    </div>
  );
};

export default CategoryTable;
