import React, { useState } from 'react';
import { Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CartItemRow = ({ item, onUpdateQuantity, onRemove }) => {
  const [updating, setUpdating] = useState(false);

  const handleQtyChange = async (newQty) => {
    if (newQty < 1 || updating) return;
    try {
      setUpdating(true);
      await onUpdateQuantity(item.id, newQty);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200 gap-4">
      {/* Product Image & Info */}
      <div className="flex items-center gap-4">
        <img
          src={item.productImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200'}
          alt={item.productName}
          className="w-16 h-16 object-cover rounded-lg bg-slate-100 shrink-0"
        />
        <div>
          <Link
            to={`/products/${item.productId}`}
            className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition line-clamp-1"
          >
            {item.productName}
          </Link>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span>Brand: {item.productBrand}</span>
            <span>SKU: {item.productSku}</span>
          </div>
          {!item.inStock && (
            <div className="flex items-center gap-1 text-xs text-amber-600 font-medium mt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Requested quantity exceeds available stock ({item.availableStock})</span>
            </div>
          )}
        </div>
      </div>

      {/* Quantity & Price Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        {/* Quantity Stepper */}
        <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
          <button
            onClick={() => handleQtyChange(item.quantity - 1)}
            disabled={item.quantity <= 1 || updating}
            className="p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="px-3 text-xs font-semibold text-slate-800">
            {item.quantity}
          </span>
          <button
            onClick={() => handleQtyChange(item.quantity + 1)}
            disabled={item.quantity >= item.availableStock || updating}
            className="p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Line Total */}
        <div className="text-right min-w-[90px]">
          <div className="text-sm font-bold text-slate-900">
            ₹{Number(item.lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400">
            ₹{Number(item.unitPrice).toLocaleString('en-IN')} each
          </div>
        </div>

        {/* Delete Item */}
        <button
          onClick={() => onRemove(item.id)}
          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
          title="Remove from cart"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItemRow;
