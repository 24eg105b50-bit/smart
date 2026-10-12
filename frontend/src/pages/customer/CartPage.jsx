import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItemRow from '../../components/cart/CartItemRow';
import EmptyState from '../../components/common/EmptyState';
import { ShoppingBag, ArrowRight, Trash2, Truck, ShieldCheck } from 'lucide-react';

export const CartPage = () => {
  const { cartSummary, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading && !cartSummary) {
    return <div className="text-center p-12 text-slate-500">Loading cart...</div>;
  }

  if (!cartSummary || !cartSummary.items || cartSummary.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your campus shopping cart is empty"
        description="Discover academic textbooks, coding laptops, mechanical keyboards, and lab hardware."
        actionText="Browse Catalog"
        actionLink="/catalog"
      />
    );
  }

  const freeShippingThreshold = 499;
  const subtotal = Number(cartSummary.subtotal) || 0;
  const diffForFreeDelivery = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">
            {cartSummary.totalItems} {cartSummary.totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Free Shipping Tracker */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                {diffForFreeDelivery === 0
                  ? '🎉 You unlocked FREE Campus Hostel Delivery!'
                  : `Add ₹${diffForFreeDelivery.toFixed(2)} more for FREE Campus Delivery`}
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {cartSummary.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal ({cartSummary.totalItems} items)</span>
              <span className="font-semibold text-slate-900">
                ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Campus Delivery Fee</span>
              <span className="font-semibold text-slate-900">
                {Number(cartSummary.estimatedShipping) === 0 ? (
                  <span className="text-emerald-600">FREE</span>
                ) : (
                  `₹${Number(cartSummary.estimatedShipping).toFixed(2)}`
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Student Subsidy / Discount</span>
              <span className="font-semibold text-emerald-600">
                -₹{Number(cartSummary.estimatedDiscount || 0).toFixed(2)}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Amount</span>
              <span className="text-base text-blue-600">
                ₹{Number(cartSummary.estimatedTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {!cartSummary.allItemsInStock && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              ⚠️ One or more items in your cart exceed current available inventory. Please adjust quantities to proceed.
            </div>
          )}

          <button
            onClick={() => navigate('/checkout')}
            disabled={!cartSummary.allItemsInStock}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-[11px] text-slate-400 space-y-1 text-center">
            <p className="flex items-center justify-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Verified Campus Transaction
            </p>
            <p>Simulated payment demonstration for AU-R24 project</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
