import { HomeOutlined, RightOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items, onNavigate }) => {
  const handleClick = (item) => {
    if (onNavigate && item.id) {
      onNavigate(item.id);
    }
  };

  return (
    <nav className='flex items-center text-sm'>
      <Link to='/' className='flex items-center text-gray-600 hover:text-primaryColor'>
        <HomeOutlined className='text-base' />
        <span className='ml-1'>Trang chủ</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className='flex items-center'>
          <RightOutlined className='mx-2 text-[10px] text-gray-400' />
          {index === items.length - 1 ? (
            <span className='font-medium text-primaryColor'>{item.name}</span>
          ) : (
            <Link to={item.path} className='text-gray-600 hover:text-primaryColor' onClick={() => handleClick(item)}>
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      id: PropTypes.string
    })
  ).isRequired,
  onNavigate: PropTypes.func
};

export default Breadcrumb;
