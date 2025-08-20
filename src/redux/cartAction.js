// redux/cartAction.js
export const ADD_TO_CART = "ADD_TO_CART";
export const SET_CART_ITEMS = "SET_CART_ITEMS";

// Add to cart action (local Redux add)
export const addToCart = (product) => {
  return {
    type: ADD_TO_CART,
    payload: product,
  };
};

// Set cart items directly (no API call)
export const fetchCartItems = (cartItems) => {
  return {
    type: SET_CART_ITEMS,
    payload: cartItems,
  };
};
