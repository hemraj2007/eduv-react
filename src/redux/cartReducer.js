// redux/cartReducer.js
import { ADD_TO_CART, SET_CART_ITEMS } from "./cartAction";

const initialState = {
  items: [],
};

const cartReducer = (state = initialState, action) => {  
  switch (action.type) {
    case ADD_TO_CART:
      const existingIndex = state.items.findIndex(item => item._id === action.payload._id);
      if (existingIndex !== -1) {
        // If item exists, increase quantity
        const updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += 1;
        return {
          ...state,
          items: updatedItems,
        };
      } else {
        // Add new item
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }],
        };
      }

      case SET_CART_ITEMS:
        return {
          ...state,
          items: action.payload, // no quantity mapping
        };
    default:
      return state;
  }
};

export default cartReducer;