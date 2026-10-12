import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogApi, reviewApi, wishlistApi } from '../../api/apiServices';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import RatingStars from '../../components/common/RatingStars';
import ProductCard from '../../components/product/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const [prodRes, relRes, revRes] = await Promise.all([
          catalogApi.getProductById(id),
          catalogApi.getRelatedProducts(id, 4),
          reviewApi.getProductReviews(id),
        ]);

        if (prodRes.success) setProduct(prodRes.data);
        if (relRes.success) setRelated(relRes.data);
        if (revRes.success) setReviews(revRes.data);
      } catch (err) {
        console.error('Error loading product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.stockQuantity <= 0) return;
    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.message || 'Please log in to add to cart.');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      alert('Please log in to manage your wishlist.');
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setReviewError('You must be logged in to submit a review.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError(null);
      const res = await reviewApi.submitReview({
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.success) {
        setReviewSuccess(true);
        setReviewComment('');
        // Reload reviews & product
        const updatedRevs = await reviewApi.getProductReviews(id);
        if (updatedRevs.success) setReviews(updatedRevs.data);
        const updatedProd = await catalogApi.getProductById(id);
        if (updatedProd.success) setProduct(updatedProd.data);
      }
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading product details..." />;
  if (!product) return <div className="text-center p-12 text-slate-500">Product not found.</div>;

  const isInStock = product.stockQuantity > 0;

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-blue-600">Catalog</Link>
        <span>/</span>
        <Link to={`/catalog?categoryId=${product.categoryId}`} className="hover:text-blue-600">
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left: Product Image */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-4">
          <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 relative">
            <img
              src={product.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-blue-600">
                {product.brand}
              </span>
              <span className="font-mono text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-4">
              <RatingStars rating={product.averageRating} count={product.reviewCount} />
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">
                Category: {product.categoryName}
              </span>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-3xl font-extrabold text-slate-900">
                ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Inclusive of student discount subsidies</p>
            </div>

            <div>
              {isInStock ? (
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    In Stock ({product.stockQuantity} units)
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Hostel Delivery: Ready</p>
                </div>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-sm text-slate-600 leading-relaxed">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
            <p>{product.description}</p>
          </div>

          {/* Action Row: Quantity & Add to Cart */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-200">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || !isInStock}
                className="p-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-bold text-slate-800">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                disabled={quantity >= product.stockQuantity || !isInStock}
                className="p-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              disabled={!isInStock || adding}
              className={`flex-1 w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-md ${
                added
                  ? 'bg-emerald-600 text-white'
                  : isInStock
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className={`p-3.5 rounded-xl border border-slate-300 hover:border-slate-400 transition ${
                wishlisted ? 'bg-rose-50 text-rose-600 border-rose-300' : 'text-slate-600'
              }`}
              title="Save to Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-600' : ''}`} />
            </button>
          </div>

          {/* Campus Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Campus Delivery in 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Verified Hardware Specs</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
              <span>7-Day Lab Return Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Verified Student Reviews</h2>
            <p className="text-xs text-slate-500 mt-0.5">Reviews submitted by students who purchased this item</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900">
              {Number(product.averageRating).toFixed(1)}
            </span>
            <span className="text-xs text-slate-400"> / 5.0 ({product.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Existing Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No reviews yet for this product. Be the first verified student to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{rev.userFullName}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                      Verified Buyer
                    </span>
                  </div>
                  <RatingStars rating={rev.rating} />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Review Submission Form */}
        <div className="pt-6 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Write a Review
          </h3>

          {reviewSuccess ? (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg font-medium">
              Thank you! Your verified review has been published.
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              {reviewError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-700">Rating:</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5"
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Below Average</option>
                  <option value={1}>1 Star - Poor</option>
                </select>
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder="Share your practical experience with this academic supply..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Related Products Section */}
      {related.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Related Course Supplies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
