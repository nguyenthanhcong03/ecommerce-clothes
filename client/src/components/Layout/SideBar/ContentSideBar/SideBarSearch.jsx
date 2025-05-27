import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input';
import MenuItem from '@/components/common/MenuItem/MenuItem';
import ProductCard from '@/components/product/ProductCard/ProductCard';
import useDebounce from '@/hooks/useDebounce';
import { getAllProductsAPI } from '@/services/productService';
import { toggleSidebar } from '@/store/slices/sidebarSlice';
import { Search } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

function SideBarSearch() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const handleSearch = useCallback(async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await getAllProductsAPI({
        search: query,
        limit: 4
      });
      setSearchResults(response.data.products);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect để xử lý tìm kiếm khi query thay đổi
  useEffect(() => {
    handleSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, handleSearch]);

  const handleSubmitSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('search', searchQuery);
      dispatch(toggleSidebar());
      navigate(`/shop?${params.toString()}`);
    }
  };

  return (
    <div className='flex h-full w-[300px] flex-col items-center gap-6 p-4 md:w-[400px]'>
      <div className='flex flex-col items-center text-lg text-secondaryColor'>
        <Search width={24} cursor={'pointer'} />
        <MenuItem text={'TÌM KIẾM'} />
      </div>
      <div className='mb-8 flex items-center justify-between gap-1'>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Tìm kiếm sản phẩm..'
          className='h-[38px] flex-1'
        />
        <Button onClick={handleSubmitSearch}>
          <Search width={20} />
        </Button>
      </div>
      {loading ? (
        <div>Đang tìm kiếm...</div>
      ) : searchResults.length > 0 ? (
        <div className='grid w-full max-w-[1280px] grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4'>
          {searchResults.map((product) => (
            <Link to={`/product/${product._id}`} onClick={() => dispatch(toggleSidebar())} key={product._id}>
              <ProductCard
                item={product}
                isShowButton={false}
                isShowVariant={false}
                isShowActionButtons={false}
                onClick={() => dispatch(toggleSidebar())}
              />
            </Link>
          ))}
        </div>
      ) : searchQuery ? (
        <div className='text-gray-500'>Không tìm thấy sản phẩm nào</div>
      ) : null}
    </div>
  );
}

export default SideBarSearch;
