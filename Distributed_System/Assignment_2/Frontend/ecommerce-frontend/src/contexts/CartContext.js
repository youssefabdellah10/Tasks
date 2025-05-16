import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  
  // Load cart from localStorage on component mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing stored cart', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update cart count and total
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    const price = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    setCartCount(count);
    setCartTotal(price);
  }, [cartItems]);
  
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
    localStorage.removeItem('cart');
  };
  
  // Format cart items for order submission
  const getOrderItems = () => {
    return cartItems.map(item => ({
      dishId: item.dishId,
      quantity: item.quantity
    }));
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
