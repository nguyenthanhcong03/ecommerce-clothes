import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, Image, Tag } from 'antd';
import axios from 'axios';
import ProductForm from './ProductForm';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, setIsOpenForm, setSelectedProduct } from '@redux/features/product/productSlice';

const ProductTable = () => {
  const dispatch = useDispatch();
  const { products, status, error, page, pages, total, isOpenForm, selectedProduct } = useSelector(
    (state) => state.product
  );
  // const [products, setProducts] = useState([]);
  // const [isOpenForm, setIsOpenForm] = useState(false);
  // const [selectedProduct, setSelectedProduct] = useState(null);

  // Lấy danh sách product từ backend

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 10 }));
  }, []);

  // Xóa product
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/products/${id}`);
      fetchProducts(); // Cập nhật lại danh sách
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Mở form chỉnh sửa
  const handleEdit = (product) => {
    dispatch(setSelectedProduct(product));
    dispatch(setIsOpenForm(true));
  };

  // Mở form thêm mới
  const handleAdd = () => {
    dispatch(setSelectedProduct(null));
    dispatch(setIsOpenForm(true));
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'images',
      key: 'images',
      render: (images) => (
        <Image.PreviewGroup>
          {images.slice(0, 2).map((img, index) => (
            <Image key={index} width={40} height={40} src={img} style={{ objectFit: 'cover', marginRight: 4 }} />
          ))}
        </Image.PreviewGroup>
      )
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name'
    },
    {
      title: 'categoryId',
      dataIndex: 'categoryId'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description'
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'brand'
    },
    {
      title: 'Đánh giá',
      dataIndex: 'averageRating'
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => (
        <>
          {tags.map((tag) => (
            <Tag color='blue' key={tag}>
              {tag}
            </Tag>
          ))}
        </>
      )
    },

    {
      title: 'Tình trạng',
      key: 'variants',
      render: (_, record) => {
        const hasInStock = record.variants.some((v) => v.stock > 0);

        if (hasInStock) {
          return <Tag color='green'>Còn hàng</Tag>;
        } else {
          return <Tag color='red'>Hết hàng</Tag>;
        }
      }
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
            title='Bạn có chắc muốn xóa sản phẩm này?'
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

  // const columns = [
  //   {
  //     title: 'Ảnh sản phẩm',
  //     dataIndex: 'image',
  //     key: 'image',
  //     render: (image) => <Image src={image} width={50} height={50} />
  //   },
  //   {
  //     title: 'Tên sản phẩm',
  //     dataIndex: 'name',
  //     key: 'name'
  //   },
  //   {
  //     title: 'Mô tả',
  //     dataIndex: 'description',
  //     key: 'description'
  //   },
  //   {
  //     title: 'Trạng thái',
  //     dataIndex: 'isActive',
  //     key: 'isActive',
  //     render: (isActive) => (isActive ? 'Hoạt động' : 'Không hoạt động')
  //   },
  //   {
  //     title: 'Ưu tiên',
  //     dataIndex: 'priority',
  //     key: 'priority'
  //   },
  //   {
  //     title: 'Hành động',
  //     key: 'action',
  //     render: (_, record) => (
  //       <Space size='middle'>
  //         <Button type='link' onClick={() => handleEdit(record)}>
  //           Sửa
  //         </Button>
  //         <Popconfirm
  //           title='Bạn có chắc muốn xóa sản phẩm này?'
  //           onConfirm={() => handleDelete(record._id)}
  //           okText='Có'
  //           cancelText='Không'
  //         >
  //           <Button type='link' danger>
  //             Xóa
  //           </Button>
  //         </Popconfirm>
  //       </Space>
  //     )
  //   }
  // ];

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'odd',
        text: 'Select Odd Row',
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return false;
            }
            return true;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        }
      },
      {
        key: 'even',
        text: 'Select Even Row',
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return true;
            }
            return false;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        }
      }
    ]
  };

  return (
    <div>
      <Button type='primary' onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm sản phẩm mới
      </Button>
      <Table
        rowKey='_id'
        className='custom-header-font rounded-lg border bg-white'
        rowSelection={rowSelection}
        columns={columns}
        dataSource={products}
        pagination={{ pageSize: 2 }}
        rowClassName={(record, index) => (index % 2 === 0 ? 'bg-[#fafafa]' : 'bg-white')}
        bordered
      />
      <ProductForm />
    </div>
  );
};

export default ProductTable;
