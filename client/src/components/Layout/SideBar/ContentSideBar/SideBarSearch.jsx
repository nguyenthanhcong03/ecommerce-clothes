import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input';
import MenuItem from '@/components/common/MenuItem/MenuItem';
import ProductCard from '@/components/product/ProductCard/ProductCard';
import useDebounce from '@/hooks/useDebounce';
import { getAllProductsAPI } from '@/services/productService';
import { toggleSidebar } from '@/store/slices/sidebarSlice';
import { generateNameId } from '@/utils/helpers/fn';
import { CircleX, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

function SideBarSearch() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useSearchParams();

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
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialSearch = params.get('search') || '';
    setSearchQuery(initialSearch);
  }, [params]);

  useEffect(() => {
    searchInputRef.current?.focus();
    handleSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, params, handleSearch]);

  const handleSubmitSearch = () => {
    const newParams = new URLSearchParams();
    if (searchQuery) {
      newParams.set('search', searchQuery);
      setParams(newParams);
      navigate(`/shop?${newParams.toString()}`);
      dispatch(toggleSidebar());
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
          suffix={
            searchQuery ? (
              <CircleX width={16} cursor={'pointer'} onClick={() => setSearchQuery('')} />
            ) : (
              <div className='w-4 text-transparent'></div>
            )
          }
          ref={searchInputRef}
        />
        <Button onClick={handleSubmitSearch}>
          <Search width={20} />
        </Button>
      </div>
      {loading ? (
        <div>Đang tìm kiếm...</div>
      ) : searchResults.length > 0 ? (
        <div className='grid w-full max-w-[1280px] grid-cols-2 gap-2'>
          {searchResults.map((product) => (
            <Link
              to={`/product/${generateNameId({ name: product.name, id: product._id })}`}
              onClick={() => dispatch(toggleSidebar())}
              key={product._id}
            >
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
