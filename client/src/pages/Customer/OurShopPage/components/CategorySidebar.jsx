import { getCategoriesTree } from '@/store/slices/categorySlice';
import { CaretRightOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import { ca } from 'date-fns/locale';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

const CategoryItem = ({ category, level = 0, selectedCategoryId, setSearchParams }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = category._id === selectedCategoryId;
  const navigate = useNavigate();

  return (
    <div className='category-item'>
      <div
        className={`group flex cursor-pointer items-center py-3 ${
          isSelected ? 'bg-gray-100' : ''
        } ${level === 0 ? 'px-4' : level === 1 ? 'px-4 pl-8' : 'px-4 pl-12'}`}
      >
        <div className='flex flex-1 items-center'>
          <div className={`flex-1 text-sm font-semibold transition-colors`}>
            <span className='hover:underline' onClick={() => navigate(`/shop/${category.slug}/${category._id}`)}>
              {category.name}
            </span>
            {category.productsCount > 0 && (
              <span className='ml-2 text-xs text-gray-400'>({category.productsCount})</span>
            )}
          </div>
          {hasChildren && (
            <CaretRightOutlined
              className={`mr-2 text-xs transition-transform ${isExpanded ? 'rotate-90' : ''} ${
                isSelected || (hasChildren && findSelectedInChildren(category.children, selectedCategoryId))
                  ? 'text-primaryColor'
                  : 'text-gray-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            />
          )}
          {/* {!hasChildren && <span className='mr-2 w-4' />} */}
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className='category-children flex flex-col gap-2 pb-4'>
          {category.children.map((child) => (
            <div key={child._id}>
              {/* <CategoryItem
                category={child}
                level={level + 1}
                selectedCategoryId={selectedCategoryId}
                setSearchParams={setSearchParams}
              /> */}
              <div
                className='cursor-pointer pl-6 pr-4 text-sm hover:underline'
                onClick={() => navigate(`/shop/${child.slug}/${child._id}`)}
              >
                {child.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

CategoryItem.propTypes = {
  category: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.object),
    productsCount: PropTypes.number
  }).isRequired,
  level: PropTypes.number,
  selectedCategoryId: PropTypes.string,
  setSearchParams: PropTypes.func.isRequired
};

// Helper function to find selected category and its children
const findSelectedCategoryBranch = (categories, categoryId) => {
  if (!categories || !categoryId) return null;

  for (let category of categories) {
    if (category._id === categoryId) {
      return category;
    }
    if (category.children) {
      const found = findSelectedCategoryBranch(category.children, categoryId);
      if (found) return found;
    }
  }
  return null;
};

// Helper function to find if a category is selected in the children
const findSelectedInChildren = (children, selectedId) => {
  if (!children || !selectedId) return false;
  return children.some((child) => child._id === selectedId || findSelectedInChildren(child.children, selectedId));
};

export function CategorySidebar() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categoriesTree, treeLoading } = useSelector((state) => state.category);
  const { catId } = useParams();

  useEffect(() => {
    dispatch(getCategoriesTree());
  }, [dispatch]);

  if (treeLoading) {
    return (
      <div className='rounded-md bg-white p-4'>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  // Tìm danh mục được chọn và các danh mục con của nó
  const selectedCategory = findSelectedCategoryBranch(categoriesTree, catId);
  const categoriesToShow = selectedCategory
    ? selectedCategory.children || [] // Nếu có danh mục được chọn, chỉ hiện các con của nó
    : categoriesTree; // Nếu không, hiện tất cả danh mục gốc

  if (!selectedCategory && !categoriesToShow.length) {
    return <div className='p-4 text-center text-gray-500'>Không có danh mục nào</div>;
  }

  return (
    <div>
      {categoriesToShow.length > 0 && (
        <div className='mb-6 overflow-hidden rounded-md bg-white'>
          <div className='p-4'>
            <h2 className='text-lg font-medium'>Khám phá theo danh mục</h2>
          </div>
          {/* Render danh sách danh mục */}
          <div className=''>
            {categoriesToShow.map((category) => (
              <div className='border-t' key={category._id}>
                <CategoryItem category={category} selectedCategoryId={catId} setSearchParams={setSearchParams} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
