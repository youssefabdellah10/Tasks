import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const { currentUser } = useContext(AuthContext);
  
  // Load cart from localStorage on component mount and whenever user changes
  useEffect(() => {
    // If user is not authenticated, clear cart
    if (!currentUser) {
      localStorage.removeItem('cart');
      setCartItems([]);
      return;
    }
    
    const userId = currentUser.userId;
    const cartKey = `cart_${userId}`;
    
    const storedCart = localStorage.getItem(cartKey);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing stored cart', error);
        localStorage.removeItem(cartKey);
      }
    } else {
      // No stored cart for this user, clear cart items
      setCartItems([]);
    }
  }, [currentUser]);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!currentUser) return;
    
    const userId = currentUser.userId;
    const cartKey = `cart_${userId}`;
    
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
    
    // Update cart count and total
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    const price = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    setCartCount(count);
    setCartTotal(price);
  }, [cartItems, currentUser]);
  
  // Add item to cart
  const addToCart = (item) => {
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.dishId === item.id);
    
    if (existingItemIndex >= 0) {
      // Item already exists in cart, update quantity
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1
      };
      setCartItems(updatedItems);
    } else {
      // Item doesn't exist in cart, add it
      setCartItems([...cartItems, {
        dishId: item.id,
        name: item.name,
        price: item.price,
        sellerName: item.sellerusername,
        quantity: 1
      }]);
    }
  };
  
  // Remove item from cart
  const removeFromCart = (dishId) => {
    setCartItems(cartItems.filter(item => item.dishId !== dishId));
  };
  
  // Update quantity of an item in cart
  const updateQuantity = (dishId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(dishId);
      return;
    }
    
    setCartItems(cartItems.map(item => 
      item.dishId === dishId ? { ...item, quantity } : item
    ));
  };
  
  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
    if (currentUser) {
      const userId = currentUser.userId;
      localStorage.removeItem(`cart_${userId}`);
    } else {
      localStorage.removeItem('cart'); // Remove any legacy cart data
    }
  };
  
  // Format cart items for order submission
  const getOrderItems = () => {
    // Validate cart items and ensure they're properly formatted for the backend
    return cartItems.map(item => {
      // Make sure dishId and quantity are integers
      const dishId = parseInt(item.dishId, 10);
      const quantity = parseInt(item.quantity, 10);
      
      // Add validation to ensure we don't send invalid data
      if (isNaN(dishId)) {
        console.error(`Invalid dishId in cart item:`, item);
        throw new Error(`Invalid dishId in cart: ${item.dishId}`);
      }
      
      if (isNaN(quantity) || quantity <= 0) {
        console.error(`Invalid quantity in cart item:`, item);
        throw new Error(`Invalid quantity in cart: ${item.quantity}`);
      }
      
      // Return properly formatted item
      return {
        dishId,
        quantity
      };
    });
  };
  
  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getOrderItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
