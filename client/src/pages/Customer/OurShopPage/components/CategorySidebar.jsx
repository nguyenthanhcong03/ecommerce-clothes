import { getCategoriesTree } from '@/store/slices/categorySlice';
import { CaretRightOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
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
        className={`group flex items-center py-3 ${
          isSelected ? 'bg-gray-100' : ''
        } ${level === 0 ? 'px-4' : level === 1 ? 'px-4 pl-8' : 'px-4 pl-12'}`}
      >
        <div className='flex flex-1 items-center'>
          <div
            className={`flex flex-1 cursor-pointer items-center gap-2 text-sm font-semibold transition-colors`}
            onClick={() => navigate(`/shop/${category.slug}/${category._id}`)}
          >
            <img src={category?.images[0]} alt={category?.name} width={40} />
            <span className='hover:underline'>{category?.name}</span>
          </div>
          {hasChildren && (
            <CaretRightOutlined
              className={`rounded-full p-2 text-xs transition-transform hover:bg-slate-100 ${isExpanded ? 'rotate-90' : ''} `}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            />
          )}
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className='category-children flex flex-col gap-2 pb-4'>
          {category.children.map((child) => (
            <div key={child._id}>
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

export function CategorySidebar() {
  const dispatch = useDispatch();
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
  const selectedCategory = findSelectedCategory(categoriesTree, catId);
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
                <CategoryItem category={category} selectedCategoryId={catId} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
