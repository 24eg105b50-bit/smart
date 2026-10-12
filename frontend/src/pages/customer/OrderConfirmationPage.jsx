import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';

export const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="max-w-2xl mx-auto my-8 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-6">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Order Placed Successfully!</h1>
        <p className="text-xs text-slate-500 mt-1">
          Thank you for choosing ShopSphere Campus. Your campus delivery is being prepared.
        </p>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block text-left text-xs space-y-2 w-full">
        <div className="flex justify-between border-b border-slate-200 pb-2">
          <span className="text-slate-500 font-medium">Order Reference:</span>
          <span className="font-mono font-bold text-blue-600">{orderNumber}</span>
        </div>

        {order && (
          <>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Total Paid (Simulated):</span>
              <span className="font-bold text-slate-900">
                ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Payment Method:</span>
              <span className="font-semibold text-slate-800">{order.paymentMethod}</span>
            </div>

            <div className="text-left pt-1">
              <span className="text-slate-500 font-medium block mb-1">Delivering to:</span>
              <p className="font-semibold text-slate-800">{order.recipientName} ({order.recipientPhone})</p>
              <p className="text-slate-600">{order.addressSnapshot}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link
          to="/my-orders"
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" />
          View My Orders
        </Link>
        <Link
          to="/catalog"
          className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
