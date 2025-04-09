import React from 'react';

export default function FooterAdmin() {
  return (
    <>
      <footer className='bottom-0 left-0 right-0 block bg-slate-50 py-4'>
        <div className='container mx-auto px-4'>
          <hr className='border-b-1 border-blueGray-200 mb-4' />
          <div className='flex flex-wrap items-center justify-center md:justify-between'>
            <div className='w-full px-4 md:w-4/12'>
              <div className='text-blueGray-500 py-1 text-center text-sm font-semibold md:text-left'>
                Copyright © {new Date().getFullYear()}{' '}
                <a
                  href='https://www.creative-tim.com?ref=nr-footer-admin'
                  className='text-blueGray-500 hover:text-blueGray-700 py-1 text-sm font-semibold'
                >
                  Creative Tim
                </a>
              </div>
            </div>
            <div className='w-full px-4 md:w-8/12'>
              <ul className='flex list-none flex-wrap justify-center md:justify-end'>
                <li>
                  <a
                    href='https://www.creative-tim.com?ref=nr-footer-admin'
                    className='text-blueGray-600 hover:text-blueGray-800 block px-3 py-1 text-sm font-semibold'
                  >
                    Creative Tim
                  </a>
                </li>
                <li>
                  <a
                    href='https://www.creative-tim.com/presentation?ref=nr-footer-admin'
                    className='text-blueGray-600 hover:text-blueGray-800 block px-3 py-1 text-sm font-semibold'
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href='http://blog.creative-tim.com?ref=nr-footer-admin'
                    className='text-blueGray-600 hover:text-blueGray-800 block px-3 py-1 text-sm font-semibold'
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href='https://github.com/creativetimofficial/notus-react/blob/main/LICENSE.md?ref=nr-footer-admin'
                    className='text-blueGray-600 hover:text-blueGray-800 block px-3 py-1 text-sm font-semibold'
                  >
                    MIT License
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
