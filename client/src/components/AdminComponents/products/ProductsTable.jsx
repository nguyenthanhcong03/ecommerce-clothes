import { motion } from 'framer-motion';
import { Edit, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchProducts } from '../../../redux/features/product/productSlice';
import { useDispatch, useSelector } from 'react-redux';

const PRODUCT_DATA = [
  { id: 1, name: 'Wireless Earbuds', category: 'Electronics', price: 59.99, stock: 143, sales: 1200 },
  { id: 2, name: 'Leather Wallet', category: 'Accessories', price: 39.99, stock: 89, sales: 800 },
  { id: 3, name: 'Smart Watch', category: 'Electronics', price: 199.99, stock: 56, sales: 650 },
  { id: 4, name: 'Yoga Mat', category: 'Fitness', price: 29.99, stock: 210, sales: 950 },
  { id: 5, name: 'Coffee Maker', category: 'Home', price: 79.99, stock: 78, sales: 720 }
];

const ProductsTable = () => {
  const dispatch = useDispatch();
  const { products, status, error, page, pages } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 10 }));
  }, [dispatch]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(PRODUCT_DATA);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = PRODUCT_DATA.filter(
      (product) => product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term)
    );

    setFilteredProducts(filtered);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
    // return <Loading />;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <motion.div
      className='mb-8 rounded-xl border border-gray-700 bg-gray-800 bg-opacity-50 p-6 shadow-lg backdrop-blur-md'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-gray-100'>Product List</h2>
        <div className='flex gap-2'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Search products...'
              className='rounded-lg bg-gray-700 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
              onChange={handleSearch}
              value={searchTerm}
            />
            <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
          </div>
          <button className='rounded-md bg-green-500 px-2'>Thêm mới</button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-700'>
          <thead>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400'>Name</th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400'>
                Category
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400'>Price</th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400'>Stock</th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400'>Sales</th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400'>
                Actions
              </th>
            </tr>
          </thead>

          <tbody className='divide-y divide-gray-700'>
            {products.map((product) => (
              <motion.tr
                key={product._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className='flex items-center gap-2 whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-100'>
                  <img
                    src='https://images.unsplash.com/photo-1627989580309-bfaf3e58af6f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d2lyZWxlc3MlMjBlYXJidWRzfGVufDB8fDB8fHww'
                    alt='Product img'
                    className='size-10 rounded-full'
                  />
                  {product.name}
                </td>
                <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-300'>{product.categoryId}</td>
                <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-300'>${product.variants[0].price}</td>
                <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-300'>{product.brand}</td>
                <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-300'>{product.averageRating}</td>
                <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-300'>
                  <button className='mr-2 text-indigo-400 hover:text-indigo-300'>
                    <Edit size={18} />
                  </button>
                  <button className='text-red-400 hover:text-red-300'>
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
export default ProductsTable;
