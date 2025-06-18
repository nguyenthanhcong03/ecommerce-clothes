const AdminHeader = ({ title }) => {
  return (
    <header className='border-b border-[#e1e1e1] bg-white shadow-lg backdrop-blur-md'>
      <div className='px-4 py-4 sm:px-6 lg:px-8'>
        <h1 className='text-2xl font-semibold text-primaryColor'>{title}</h1>
      </div>
    </header>
  );
};
export default AdminHeader;
