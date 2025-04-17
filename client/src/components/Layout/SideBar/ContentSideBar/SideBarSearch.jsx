import MenuItem from '@/components/common/MenuItem/MenuItem';
import ProductCard from '@/components/product/ProductCard/ProductCard';
import { Search } from 'lucide-react';
import React from 'react';

function SideBarSearch() {
  return (
    <div className='flex h-full w-[300px] flex-col items-center gap-6 px-8 py-5 md:w-[400px]'>
      <div className='flex flex-col items-center text-lg text-secondaryColor'>
        <Search fontSize={24} cursor={'pointer'} />
        <MenuItem text={'TÌM KIẾM'} href={'/'} />
      </div>
      <div className='mx-auto flex w-full items-center justify-center gap-2 border-[1px] border-[#e1e1e1]'>
        <input
          className='h-[35px] flex-1 px-[10px] py-[4px] text-sm outline-none'
          type='text'
          placeholder='Tìm kiếm sản phẩm...'
        />
        <Search fontSize={18} cursor={'pointer'} className='mr-2' />
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <ProductCard
          src={'https://xstore.b-cdn.net/elementor2/marseille04/wp-content/uploads/sites/2/2022/12/Image-15.2-min.jpg'}
          previewSrc={
            'https://xstore.b-cdn.net/elementor2/marseille04/wp-content/uploads/sites/2/2022/12/Image-15.2-min.jpg'
          }
          name={'ahha'}
          price={'jậ'}
          isSearchMobile={true}
        />
        <ProductCard
          src={'https://xstore.b-cdn.net/elementor2/marseille04/wp-content/uploads/sites/2/2022/12/Image-15.2-min.jpg'}
          previewSrc={
            'https://xstore.b-cdn.net/elementor2/marseille04/wp-content/uploads/sites/2/2022/12/Image-15.2-min.jpg'
          }
          name={'ahha'}
          price={'jậ'}
          isSearchMobile={true}
        />
      </div>
    </div>
  );
}

export default SideBarSearch;
