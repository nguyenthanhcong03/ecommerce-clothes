import { LockOpen } from 'lucide-react';
import PropTypes from 'prop-types';

const UnbanIcon = ({ onClick }) => {
  return (
    <button className='rounded-[5px] bg-[#52c41a] p-1 transition-colors' onClick={onClick}>
      <LockOpen strokeWidth={1.5} width={16} height={16} color='#fff' />
    </button>
  );
};

UnbanIcon.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default UnbanIcon;
