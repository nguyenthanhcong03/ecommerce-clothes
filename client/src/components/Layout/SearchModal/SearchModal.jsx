import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input';
import ProductCard from '@/components/product/ProductCard/ProductCard';
import useDebounce from '@/hooks/useDebounce';
import { getAllProductsAPI } from '@/services/productService';
import { toggleSearch } from '@/store/slices/searchSlice';
import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function SearchModal() {
  const isOpen = useSelector((state) => state.search.isOpen);
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
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    handleSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, isOpen, handleSearch]);

  const handleToggleSearchModal = () => {
    dispatch(toggleSearch());
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmitSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('search', searchQuery);
      handleToggleSearchModal();
      navigate(`/shop?${params.toString()}`);
    }
  };

  return (
    <div>
      <div
        className={`fixed inset-0 z-10 bg-black ${
          isOpen ? '!visible !bg-opacity-50' : 'invisible bg-opacity-0'
        } transition-all duration-300 ease-in`}
        onClick={handleToggleSearchModal}
      ></div>
      <div
        className={`fixed left-0 right-0 top-0 z-[9999] h-[600px] w-full -translate-y-full overflow-auto bg-white pb-8 shadow-lg transition-transform duration-300 ease-in ${isOpen ? '!translate-y-0' : ''}`}
      >
        <X
          width={40}
          height={40}
          className='absolute right-5 top-5 cursor-pointer text-2xl text-primaryColor opacity-100 transition-all duration-150 ease-in hover:-rotate-90 active:opacity-0'
          onClick={handleToggleSearchModal}
        />
        <div className='flex flex-col items-center justify-center'>
          <h1 className='p-7 text-2xl text-primaryColor'>Bạn muốn tìm món đồ nào?</h1>
          <div className='mb-8 flex w-full max-w-3xl items-center justify-center gap-2 px-4'>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Tìm kiếm sản phẩm..'
              className='h-[38px]'
            />
            <Button onClick={handleSubmitSearch} className='w-32'>
              Tìm kiếm
            </Button>
          </div>

          {loading ? (
            <div>Đang tìm kiếm...</div>
          ) : searchResults.length > 0 ? (
            <div className='grid w-full max-w-[1280px] grid-cols-2 gap-6 px-4 sm:grid-cols-3 lg:grid-cols-4'>
              {searchResults.map((product) => (
                <ProductCard key={product._id} item={product} />
              ))}
            </div>
          ) : searchQuery ? (
            <div className='text-gray-500'>Không tìm thấy sản phẩm nào</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
