import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartApi } from '../api/apiServices';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartSummary, setCartSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCartSummary(null);
      return;
    }
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      if (res.success && res.data) {
        setCartSummary(res.data);
      }
    } catch (err) {
      console.warn('Failed to load shopping cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add products to your cart.');
    }
    const res = await cartApi.addToCart(productId, quantity);
    await refreshCart();
    return res;
  };

  const updateQuantity = async (itemId, quantity) => {
    const res = await cartApi.updateQuantity(itemId, quantity);
    await refreshCart();
    return res;
  };

  const removeFromCart = async (itemId) => {
    const res = await cartApi.removeFromCart(itemId);
    await refreshCart();
    return res;
  };

  const clearCart = async () => {
    await cartApi.clearCart();
    setCartSummary(null);
  };

  const cartCount = cartSummary?.totalItems || 0;

  const value = {
    cartSummary,
    cartCount,
    loading,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
