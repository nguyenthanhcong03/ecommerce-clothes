import { generateNameId } from '@/utils/helpers/fn';
import { useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';

function MenuItem({ href, text, isMenuDropDown = false, onClick }) {
  const { categoriesTree, treeLoading } = useSelector((state) => state.category);
  const navigate = useNavigate();

  return (
    <div className='group'>
      <NavLink
        to={href}
        onClick={onClick}
        className={({ isActive }) =>
          isActive
            ? 'after:block after:h-[3px] after:origin-right after:bg-primaryColor after:duration-300 after:content-[""]'
            : 'after:block after:h-[3px] after:origin-right after:scale-0 after:bg-primaryColor after:opacity-0 after:duration-300 after:content-[""] hover:after:scale-100 hover:after:opacity-100'
        }
      >
        <div className='flex cursor-pointer items-center justify-center gap-2 pt-[2px] after:absolute after:top-full after:hidden after:h-[20px] after:w-full after:bg-transparent after:content-[""] after:group-hover:block'>
          <span>{text}</span>
          {isMenuDropDown && (
            <svg
              className='mt-[3px] h-5 w-5 rotate-0 transform transition-transform group-hover:rotate-180'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
            </svg>
          )}
        </div>
      </NavLink>
      <div className='relative'>
        {isMenuDropDown && (
          <ul className='absolute left-0 top-2 z-[100] hidden h-fit min-w-[220px] flex-col rounded bg-white py-2 shadow-xl transition-all duration-300 ease-in after:absolute after:left-6 after:top-[-18px] after:w-3 after:border-b-[15px] after:border-l-[40px] after:border-r-[40px] after:border-t-[10px] after:border-transparent after:border-b-white group-hover:flex'>
            {/* <ul className='absolute top-[2px] hidden w-[200px] cursor-pointer flex-col overflow-hidden rounded bg-white text-sm text-primaryColor shadow-md group-hover:flex'> */}
            {!treeLoading &&
              categoriesTree.map((category) => (
                <div
                  key={category._id}
                  className={`cursor-pointer p-3 hover:bg-[#F1F1F1] hover:text-secondaryColor`}
                  onClick={() => navigate(`/shop/${generateNameId({ name: category.name, id: category._id })}`)}
                >
                  {category.name}
                </div>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MenuItem;
