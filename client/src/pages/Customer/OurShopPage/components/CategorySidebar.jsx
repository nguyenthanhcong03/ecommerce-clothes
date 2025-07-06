import { getCategoriesTree } from '@/store/slices/categorySlice';
import { generateNameId, getIdFromNameId } from '@/utils/helpers/fn';
import { CaretRightOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import { ChevronLeft } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

const CategoryItem = ({ category, level = 0, selectedCategoryId }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = category._id === selectedCategoryId;

  return (
    <div className='category-item'>
      <div
        className={`group flex items-center py-3 transition-colors duration-200 hover:bg-gray-50 ${
          isSelected ? 'border-r-2 border-blue-500 bg-gray-100' : ''
        } ${level === 0 ? 'px-4' : level === 1 ? 'px-4 pl-8' : 'px-4 pl-12'}`}
      >
        <div className='flex flex-1 items-center'>
          <div
            className={`flex flex-1 cursor-pointer items-center gap-2 text-sm font-semibold transition-all duration-200 hover:text-blue-600`}
            onClick={() => navigate(`/shop/${generateNameId({ name: category.name, id: category._id })}`)}
          >
            <img
              src={category?.images[0]}
              alt={category?.name}
              width={40}
              className='rounded-md transition-transform duration-200 hover:scale-105'
            />
            <span className='transition-all duration-200 hover:translate-x-1 hover:underline'>{category?.name}</span>
          </div>
          {hasChildren && (
            <CaretRightOutlined
              className={`rounded-full p-2 text-xs transition-all duration-300 ease-in-out hover:scale-110 hover:bg-slate-100 ${
                isExpanded ? 'rotate-90 bg-slate-50' : 'rotate-0'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            />
          )}
        </div>
      </div>
      {hasChildren && (
        <div
          className={`category-children overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className='flex flex-col gap-2 pb-4 pt-2'>
            {category.children.map((child, index) => (
              <div
                key={child._id}
                className={`transform transition-all duration-300 ease-in-out ${
                  isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                }`}
                style={{
                  transitionDelay: isExpanded ? `${index * 50}ms` : '0ms'
                }}
              >
                <div
                  className='cursor-pointer pl-6 pr-4 text-sm transition-colors duration-200 hover:text-blue-600 hover:underline'
                  onClick={() => navigate(`/shop/${generateNameId({ name: child.name, id: child._id })}`)}
                >
                  {child.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

CategoryItem.propTypes = {
  category: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    children: PropTypes.arrayOf(PropTypes.object)
  }).isRequired,
  level: PropTypes.number,
  selectedCategoryId: PropTypes.string
};

const findSelectedCategory = (categories, categoryId) => {
  if (!categories || !categoryId) return null;

  for (let category of categories) {
    if (category._id === categoryId) {
      return category;
    }
    if (category.children) {
      const found = findSelectedCategory(category.children, categoryId);
      if (found) return found;
    }
  }
  return null;
};

export function CategorySidebar({ breadcrumbItems = [], currentCategory }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categoriesTree, treeLoading } = useSelector((state) => state.category);
  const { nameId } = useParams();
  const catId = getIdFromNameId(nameId);

  useEffect(() => {
    dispatch(getCategoriesTree());
  }, [dispatch]);

  const handleGoBack = () => {
    // Nếu có breadcrumb items và có ít nhất 2 items (Cửa hàng + current)
    if (breadcrumbItems.length >= 2) {
      const previousItem = breadcrumbItems[breadcrumbItems.length - 2];
      if (previousItem.path) {
        navigate(previousItem.path);
      } else {
        // Nếu không có path, trở về trang shop chính
        navigate('/shop');
      }
    } else {
      // Mặc định trở về trang shop chính
      navigate('/shop');
    }
  };

  // Tìm danh mục được chọn và các danh mục con của nó
  const selectedCategory = findSelectedCategory(categoriesTree, catId);
  const categoriesToShow = selectedCategory
    ? selectedCategory.children || [] // Nếu có danh mục được chọn, chỉ hiện các con của nó
    : categoriesTree; // Nếu không, hiện tất cả danh mục gốc

  if (!selectedCategory && !categoriesToShow.length) {
    return <div className='p-4 text-center text-gray-500'>Không có danh mục nào</div>;
  }

  if (treeLoading) {
    return (
      <div className='rounded-md bg-white p-4'>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <div>
      {/* {categoriesToShow.length > 0 && ( */}
      <div className='mb-6 overflow-hidden rounded-md bg-white'>
        <div className='p-4'>
          {currentCategory ? (
            <div className='flex items-center gap-2'>
              <ChevronLeft
                className='cursor-pointer transition-colors hover:text-blue-600'
                onClick={handleGoBack}
                title='Trở về'
              />
              <h2 className='text-lg font-medium'>{currentCategory.name}</h2>
            </div>
          ) : (
            <h2 className='text-lg font-medium'>Khám phá theo danh mục</h2>
          )}
        </div>
        {/* Render danh sách danh mục */}
        <div>
          {categoriesToShow &&
            categoriesToShow.map((category) => (
              <div className='border-t' key={category._id}>
                <CategoryItem category={category} selectedCategoryId={catId} />
              </div>
            ))}
        </div>
      </div>
      {/* )} */}
    </div>
  );
}
