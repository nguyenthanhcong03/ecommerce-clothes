import Headline from '@/components/common/Headline/Headline';
import { getCategoriesTree } from '@/store/slices/categorySlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function CategoryCard({ category }) {
  return (
    <Link
      to={`/shop/${category.slug}/${category._id}`}
      className='flex flex-col items-center rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md'
    >
      {category.images[0] && (
        <img src={category.images[0]} alt={category.name} className='mb-3 h-16 w-16 object-contain' />
      )}
      <h3 className='text-sm font-medium text-gray-900'>{category.name}</h3>
      {category.productsCount > 0 && (
        <span className='mt-1 text-xs text-gray-500'>{category.productsCount} sản phẩm</span>
      )}
    </Link>
  );
}

export default function CategorySection() {
  const dispatch = useDispatch();
  const { categoriesTree, treeLoading } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(getCategoriesTree());
  }, [dispatch]);

  if (treeLoading) {
    return (
      <div className='mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
        {[...Array(6)].map((_, index) => (
          <div key={index} className='animate-pulse'>
            <div className='rounded-lg bg-gray-200 p-4'>
              <div className='mx-auto mb-3 h-16 w-16 rounded-full bg-gray-300'></div>
              <div className='mx-auto h-4 w-3/4 rounded bg-gray-300'></div>
              <div className='mx-auto mt-2 h-3 w-1/2 rounded bg-gray-300'></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='flex justify-center gap-4 rounded-md p-4'>
      {categoriesTree.map((category) => (
        <CategoryCard key={category._id} category={category} />
      ))}
    </div>
  );
}
