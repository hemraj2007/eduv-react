// redux/reducer.js

import { combineReducers } from 'redux';
import cartReducer from './cartReducer';

// You can add more reducers here
const rootReducer = combineReducers({
  cart: cartReducer,
});

export default rootReducer;
