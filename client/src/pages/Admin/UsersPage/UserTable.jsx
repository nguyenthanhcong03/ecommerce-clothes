import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Popconfirm, Space, Table, Tag } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './styles.css';

const UserTable = ({ users }) => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  //  // Xóa product
  //   const handleDelete = async (id) => {
  //     console.log('id', id);
  //     dispatch(handleDeleteProductById({ productId: id }));
  //     if (status === 'succeeded') {
  //       alert('Xóa product thanh cong');
  //     }
  //   };

  //   // Mở form chỉnh sửa
  //   const handleEdit = (product) => {
  //     dispatch(setSelectedProduct(product));
  //     dispatch(setIsOpenForm(true));
  //   };

  //   // Mở form thêm mới
  //   const handleAdd = () => {
  //     dispatch(setSelectedProduct(null));
  //     dispatch(setIsOpenForm(true));
  //   };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Tìm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type='primary'
            icon={<SearchOutlined />}
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            size='small'
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size='small' style={{ width: 90 }}>
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase())
  });
  const { status, error, page, pages, isOpenForm, selectedUser } = useSelector((state) => state.user);
  const columns = [
    {
      title: 'firstName',
      dataIndex: 'firstName',
      key: 'firstName',
      ...getColumnSearchProps('firstName'),
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'lastName',
      dataIndex: 'lastName',
      key: 'lastName',
      ...getColumnSearchProps('lastName'),
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'email',
      dataIndex: 'email',
      key: 'email',
      ...getColumnSearchProps('email'),
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortDirections: ['ascend', 'descend']
    },
    {
      title: 'phone',
      dataIndex: 'phone'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Customer', value: 'customer' }
      ],
      onFilter: (value, record) => record.role === value
    },
    {
      title: 'status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <>
          <Tag color='blue' key={status}>
            {status}
          </Tag>
        </>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt'
      // key: 'status',
      // render: (status) => (
      //   <>
      //     <Tag color='blue' key={status}>
      //       {status}
      //     </Tag>
      //   </>
      // )
    },
    {
      title: 'Hành động',
      key: 'action',
      // fixed: 'right',
      // render: () => (
      //   <Space>
      //     <Typography.Link>Action1</Typography.Link>
      //     <Typography.Link>Action2</Typography.Link>
      //   </Space>
      // )
      render: (_, record) => (
        <Space size='middle'>
          {/* <Button type='link' onClick={() => handleEdit(record)}>
            Sửa
          </Button> */}
          <div className='cursor-pointer rounded-[5px] bg-[#0961FF] p-1'>
            <Pencil strokeWidth={1.5} width={16} height={16} onClick={() => handleEdit(record)} color='#fff' />
          </div>
          <Popconfirm
            title='Bạn có chắc muốn xóa người dùng này?'
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
    <Table
      className='custom-header-font rounded-lg border bg-white'
      rowSelection={rowSelection}
      columns={columns}
      dataSource={users}
      pagination={{ pageSize: 2 }}
      rowClassName={(record, index) => (index % 2 === 0 ? 'bg-[#fafafa]' : 'bg-white')}
      bordered
    />
  );
};

export default UserTable;
