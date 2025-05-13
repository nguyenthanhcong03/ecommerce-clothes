import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, setFilters } from '@/store/slices/adminOrderSlice';
import useDebounce from './useDebounce';

/**
 * Custom hook để quản lý dữ liệu đơn hàng
 * @param {Object} initialFilters - Giá trị filter ban đầu
 * @returns {Object} Trả về các state và functions cần thiết để quản lý đơn hàng
 */
export const useOrderManagement = (initialFilters = {}) => {
  const dispatch = useDispatch();
  const { orders, pagination, loading, error } = useSelector((state) => state.adminOrder);
  const [searchText, setSearchText] = useState('');
  const [sortInfo, setSortInfo] = useState({
    field: 'createdAt',
    order: 'descend'
  });
  const [currentFilters, setCurrentFilters] = useState(initialFilters);

  const debouncedSearchText = useDebounce(searchText, 500);

  // Tạo params cho API từ state
  const fetchOrdersWithParams = useCallback(
    (params = {}) => {
      const queryParams = {
        page: params.page || pagination.page || 1,
        limit: params.limit || pagination.limit || 10,
        search: params.search !== undefined ? params.search : debouncedSearchText,
        sortBy: params.sortBy || sortInfo.field,
        sortOrder: params.sortOrder === 'ascend' ? 'asc' : 'desc',
        status: params.status || currentFilters.status,
        isPaid: params.isPaid || currentFilters.isPaid,
        paymentMethod: params.paymentMethod || currentFilters.paymentMethod,
        dateFrom: params.dateFrom || (currentFilters.dateRange && currentFilters.dateRange[0]),
        dateTo: params.dateTo || (currentFilters.dateRange && currentFilters.dateRange[1])
      };

      // Xóa các params undefined
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      dispatch(fetchOrders(queryParams));
    },
    [dispatch, pagination.page, pagination.limit, debouncedSearchText, sortInfo, currentFilters]
  );

  // Load data khi searchText hoặc filters thay đổi
  useEffect(() => {
    fetchOrdersWithParams();
  }, [debouncedSearchText, fetchOrdersWithParams]);

  // Handlers
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    // Xử lý sort
    if (sorter && sorter.field) {
      setSortInfo({
        field: sorter.field,
        order: sorter.order
      });
    }

    // Lưu thông tin filter
    const filterValues = {};
    if (filters.status) filterValues.status = filters.status[0];
    if (filters.isPaid !== undefined) filterValues.isPaid = filters.isPaid[0];

    setCurrentFilters((prev) => ({ ...prev, ...filterValues }));

    // Lưu giá trị filters vào Redux
    dispatch(setFilters(filterValues));

    // Fetch data với params mới
    fetchOrdersWithParams({
      page: pagination.current,
      limit: pagination.pageSize,
      sortBy: sorter.field,
      sortOrder: sorter.order,
      ...filterValues
    });
  };

  const applyFilters = (filters) => {
    setCurrentFilters(filters);
    fetchOrdersWithParams({
      ...filters,
      page: 1
    });
  };

  const handleRefresh = () => {
    setSearchText('');
    setCurrentFilters({});
    setSortInfo({
      field: 'createdAt',
      order: 'descend'
    });
    fetchOrdersWithParams({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  return {
    orders,
    pagination,
    loading,
    error,
    searchText,
    sortInfo,
    currentFilters,
    handleSearch,
    handleTableChange,
    applyFilters,
    handleRefresh,
    fetchOrdersWithParams
  };
};

export default useOrderManagement;
