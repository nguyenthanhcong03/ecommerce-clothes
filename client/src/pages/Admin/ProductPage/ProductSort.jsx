import { Select } from 'antd';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

const { Option } = Select;

const ProductSort = ({ onSortChange }) => {
  const { sort } = useSelector((state) => state.adminProduct);

  return (
    <div className='mb-4 flex items-center justify-end'>
      <span style={{ marginRight: 8 }}>Sắp xếp theo:</span>
      <Select
        value={(() => {
          const sortBy = sort.sortBy;
          const sortOrder = sort.sortOrder;
          if (!sortBy) return 'default';
          if (sortBy === 'price') return `price_${sortOrder}`;
          if (sortBy === 'name') return `name_${sortOrder}`;
          if (sortBy === 'rating') return 'rating_desc';
          if (sortBy === 'popular') return 'popular';
          if (sortBy === 'createdAt' && sortOrder === 'desc') return 'default';
          return 'default';
        })()}
        onChange={onSortChange}
        style={{ width: 200 }}
        placeholder='Sắp xếp theo'
      >
        <Option value='default'>Mặc định</Option>
        <Option value='popular'>Bán chạy</Option>
        <Option value='latest'>Mới nhất</Option>
        <Option value='price_asc'>Giá thấp đến cao</Option>
        <Option value='price_desc'>Giá cao đến thấp</Option>
        <Option value='name_asc'>Tên A-Z</Option>
        <Option value='name_desc'>Tên Z-A</Option>
        <Option value='rating_desc'>Đánh giá cao</Option>
      </Select>
    </div>
  );
};

ProductSort.propTypes = {
  onSortChange: PropTypes.func.isRequired
};

export default ProductSort;
