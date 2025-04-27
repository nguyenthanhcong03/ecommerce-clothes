import Input from '@/components/common/Input/Input';
import {
  fetchProducts,
  handleDeleteProductById,
  setIsOpenForm,
  setSelectedProduct
} from '@/redux/features/product/productSlice';
import { Image, Popconfirm, Space, Table, Tag } from 'antd';
import { Pencil } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import ProductForm from './ProductForm';
import './styles.css';
import Button from '../../../components/common/Button/Button';

const ProductTable = () => {
  const dispatch = useDispatch();
  const { products, status, error, page, pages, total, isOpenForm, selectedProduct } = useSelector(
    (state) => state.product
  );
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Xóa product
  const handleDelete = async (id) => {
    console.log('id', id);
    dispatch(handleDeleteProductById({ productId: id }));
    if (status === 'succeeded') {
      alert('Xóa product thanh cong');
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

  // const categoryFilters = Array.from(new Set(products.map((item) => item.categoryId?.name))).map((name) => ({
  //   text: name,
  //   value: name
  // }));

  // Tạo filters theo slug
  const categoryFilters = Array.from(
    new Map(
      products.map((item) => [
        item.categoryId?.slug,
        {
          text: item.categoryId?.name,
          value: item.categoryId?.slug
        }
      ])
    ).values()
  );

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'images',
      key: 'images',
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
      title: 'Tên sản phẩm',
      dataIndex: 'name'
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      key: 'category',
      filters: categoryFilters,
      onFilter: (value, record) => record.categoryId?.slug === value,
      render: (category) => category?.name || 'Không xác định'
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
        return hasInStock ? <Tag color='green'>Còn hàng</Tag> : <Tag color='red'>Hết hàng</Tag>;
      },
      filters: [
        { text: 'Còn hàng', value: 'available' },
        { text: 'Hết hàng', value: 'out-of-stock' }
      ],
      onFilter: (value, record) => {
        const hasInStock = record.variants.some((v) => v.stock > 0);
        console.log('hasInStock', hasInStock);
        if (value === 'available') return hasInStock;
        if (value === 'out-of-stock') return !hasInStock;
        return false;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Space size='middle'>
          {/* <Button type='link' onClick={() => handleEdit(record)}>
            Sửa
          </Button> */}
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
      <Button onClick={handleAdd}>Thêm sản phẩm mới</Button>

      <Table
        rowKey='_id'
        className='rounded-lg border bg-white'
        // rowSelection={rowSelection}
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={products}
        pagination={{ pageSize: 5, position: ['bottomCenter'] }}
        // rowClassName={(record, index) => (index % 2 !== 0 ? 'bg-[#fafafa]' : 'bg-white')}
        // bordered
        locale={{ emptyText: status === 'loading' ? 'Đang tải dữ liệu...' : 'Không có dữ liệu' }}
        title={() => (
          <div className='flex items-center justify-between rounded-t-lg'>
            <h3 className='text-xl font-bold'>Danh sách sản phẩm</h3>
            <div className='w-full max-w-[300px]'>{/* <Input placeholder='Tìm kiếm sản phẩm' /> */}</div>
          </div>
        )}
      />

      <ProductForm />
    </div>
  );
};

export default ProductTable;
