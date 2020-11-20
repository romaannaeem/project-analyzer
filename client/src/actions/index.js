import axios from 'axios';
import { FETCH_USER } from './types';

export const fetchUser = () => async (dispatch) => {
  const res = await axios.get('/api/auth/user');
  dispatch({ type: FETCH_USER, payload: res.data });
};

// export const logoutUser = () => async (dispatch) => {
//   const res = await axios.get('/auth/logout');
//   console.log('logout dispatched', res.data);
//   dispatch({ type: LOGOUT_USER, payload: res.data });
// };
