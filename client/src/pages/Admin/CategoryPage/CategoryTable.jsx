import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, Image } from 'antd';
import axios from 'axios';
import CategoryForm from './CategoryForm';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, setIsOpenForm, setSelectedCategory } from '../../../redux/features/category/categorySlice';

const CategoryTable = () => {
  const dispatch = useDispatch();
  const { categories, status, error, page, pages, total, isOpenForm, selectedCategory } = useSelector(
    (state) => state.category
  );
  // const [categories, setCategories] = useState([]);
  // const [isOpenForm, setIsOpenForm] = useState(false);
  // const [selectedCategory, setSelectedCategory] = useState(null);

  // Lấy danh sách category từ backend

  useEffect(() => {
    dispatch(fetchCategories());
  }, []);

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
      title: 'Ảnh danh mục',
      dataIndex: 'image',
      key: 'image',
      render: (image) => <Image src={image} width={50} height={50} />
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (isActive ? 'Hoạt động' : 'Không hoạt động')
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority'
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <Button type='link' onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title='Bạn có chắc muốn xóa danh mục này?'
            onConfirm={() => handleDelete(record._id)}
            okText='Có'
            cancelText='Không'
          >
            <Button type='link' danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Button type='primary' onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm danh mục mới
      </Button>
      <Table columns={columns} dataSource={categories} rowKey='_id' pagination={{ pageSize: 2 }} />
      <CategoryForm />
    </div>
  );
};

export default CategoryTable;
