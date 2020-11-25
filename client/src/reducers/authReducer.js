import { FETCH_USER, LOGOUT_USER } from '../actions/types';

export default function (state = null, action) {
  switch (action.type) {
    case FETCH_USER:
      if (action.payload.err) {
        console.log('fetch user error', action.payload.err);
        return false;
      }
      return action.payload;
    case LOGOUT_USER:
      return action.payload;
    default:
      return state;
  }
}
