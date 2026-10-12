import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { wishlistApi } from '../../api/apiServices';
import { useAuth } from '../../context/AuthContext';
import RatingStars from '../common/RatingStars';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fallbackImage =
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!product.stockQuantity || product.stockQuantity <= 0) return;

    try {
      setAdding(true);
      await addToCart(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.message || 'Please log in to add to cart.');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to save items to your wishlist.');
      return;
    }
    try {
      if (wishlisted) {
        await wishlistApi.removeFromWishlist(product.id);
        setWishlisted(false);
      } else {
        await wishlistApi.addToWishlist(product.id);
        setWishlisted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isInStock = product.stockQuantity > 0;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden card-hover flex flex-col justify-between">
      {/* Product Image Area */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <Link to={`/products/${product.id}`}>
          <img
            src={imgError ? fallbackImage : product.imageUrl || fallbackImage}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </Link>

        {/* Category Pill */}
        {product.categoryName && (
          <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-slate-700 px-2.5 py-1 rounded-md shadow-xs">
            {product.categoryName}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition shadow-xs ${
            wishlisted
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/90 backdrop-blur-xs text-slate-500 hover:text-rose-600'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-600' : ''}`} />
        </button>
      </div>

      {/* Product Details Area */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium tracking-wide uppercase">{product.brand}</span>
            <span className="font-mono text-[10px] text-slate-400">SKU: {product.sku}</span>
          </div>

          <Link to={`/products/${product.id}`}>
            <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 hover:text-blue-600 transition mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mb-3">
            <RatingStars
              rating={product.averageRating}
              count={product.reviewCount}
            />
          </div>
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <div className="text-base font-bold text-slate-900">
              ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            {isInStock ? (
              <span className="text-[11px] font-medium text-emerald-600">In Stock</span>
            ) : (
              <span className="text-[11px] font-medium text-rose-500">Out of Stock</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!isInStock || adding}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              added
                ? 'bg-emerald-600 text-white'
                : isInStock
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
