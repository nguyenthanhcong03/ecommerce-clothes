import { useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';

function MenuItem({ href, text, isMenuDropDown = false, onClick }) {
  const { categoriesTree, treeLoading } = useSelector((state) => state.category);
  const navigate = useNavigate();

  return (
    <NavLink
      to={href}
      onClick={onClick}
      className={({ isActive }) =>
        isActive
          ? 'group after:block after:h-[3px] after:origin-right after:bg-primaryColor after:duration-300 after:content-[""]'
          : 'group after:block after:h-[3px] after:origin-right after:scale-0 after:bg-primaryColor after:opacity-0 after:duration-300 after:content-[""] hover:after:scale-100 hover:after:opacity-100'
      }
    >
      <div className='relative'>
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
        {isMenuDropDown && (
          <ul className='absolute top-[40px] hidden w-[200px] flex-col overflow-hidden rounded bg-white text-sm text-primaryColor shadow-md group-hover:flex'>
            {!treeLoading &&
              categoriesTree.map((category) => (
                <div
                  key={category._id}
                  className={`p-3 hover:bg-[#F1F1F1] hover:text-secondaryColor`}
                  onClick={() => navigate(`/shop/${category.slug}/${category._id}`)}
                >
                  {category.name}
                </div>
              ))}
          </ul>
        )}
      </div>
    </NavLink>
  );
}

export default MenuItem;
