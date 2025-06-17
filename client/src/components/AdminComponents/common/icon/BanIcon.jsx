import { Lock } from 'lucide-react';
import PropTypes from 'prop-types';

const BanIcon = ({ onClick }) => {
  return (
    <button className='rounded-[5px] bg-[#333] p-1 transition-colors' onClick={onClick}>
      <Lock strokeWidth={1.5} width={16} height={16} color='#fff' />
    </button>
  );
};

BanIcon.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default BanIcon;
