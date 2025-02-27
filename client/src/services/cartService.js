import axios from 'axios';

export const getCartByUser = () => {
  //   const url = `${API_PATH}/all`;
  const url = 'https://dummyjson.com/carts/user/5';
  return axios.get(url);
};
