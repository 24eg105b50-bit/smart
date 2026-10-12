import React, { useEffect, useState } from 'react';
import { wishlistApi } from '../../api/apiServices';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/product/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export const WishlistPage = () => {
  const { refreshCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistApi.getWishlist();
      if (res.success) {
        setItems(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleMoveToCart = async (productId) => {
    try {
      await wishlistApi.moveToCart(productId);
      await refreshCart();
      fetchWishlist();
    } catch (err) {
      alert(err.message || 'Failed to move item to cart');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await wishlistApi.removeFromWishlist(productId);
      fetchWishlist();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner text="Loading saved items..." />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Save products you want to buy later or compare before examinations."
        actionText="Explore Products"
        actionLink="/catalog"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            Saved Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved for later purchase
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <div key={product.id} className="relative flex flex-col justify-between">
            <ProductCard product={product} />
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleMoveToCart(product.id)}
                disabled={product.stockQuantity <= 0}
                className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Move to Cart
              </button>
              <button
                onClick={() => handleRemove(product.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
