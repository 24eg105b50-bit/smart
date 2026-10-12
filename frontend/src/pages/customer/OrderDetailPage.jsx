import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/apiServices';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Package,
  MapPin,
  CreditCard,
  ArrowLeft,
  XCircle,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrderById(id);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await orderApi.cancelOrder(order.id);
      if (res.success) {
        fetchOrder();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    }
  };

  if (loading) return <LoadingSpinner text="Loading order details..." />;
  if (!order) return <div className="text-center p-12 text-slate-500">Order not found.</div>;

  const statuses = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
  const currentStatusIndex = statuses.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button & Header */}
      <div>
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to My Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
          <OrderStatusBadge status={order.orderStatus} />
        </div>
      </div>

      {/* Status Progress Timeline */}
      {order.orderStatus !== 'CANCELLED' ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">
            Delivery Status
          </h2>
          <div className="grid grid-cols-4 gap-2 text-center relative">
            {statuses.map((st, idx) => (
              <div key={st} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition mb-2 ${
                    idx <= currentStatusIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {idx <= currentStatusIndex ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold ${
                    idx <= currentStatusIndex ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {st}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          ⚠️ This order was cancelled. Inventory items were released back to the campus store.
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
          Items Ordered ({order.items?.length || 0})
        </div>
        <div className="divide-y divide-slate-100 p-4 space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-900">{item.productName}</p>
                <p className="text-slate-400 text-[11px] font-mono mt-0.5">SKU: {item.sku}</p>
                <p className="text-slate-500 mt-1">
                  Qty: {item.quantity} × ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-right font-bold text-slate-900">
                ₹{Number(item.lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address & Payment Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-xs space-y-2">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Shipping Destination (Snapshot)
          </h3>
          <p className="font-semibold text-slate-800">{order.recipientName}</p>
          <p className="text-slate-500">Phone: {order.recipientPhone}</p>
          <p className="text-slate-600 leading-relaxed mt-1">{order.addressSnapshot}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-xs space-y-2">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            Payment Information
          </h3>
          <div className="flex justify-between">
            <span className="text-slate-500">Method:</span>
            <span className="font-semibold text-slate-800">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Status:</span>
            <span className="font-bold text-emerald-600">{order.paymentStatus}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-100">
            <span className="text-slate-500">Subtotal:</span>
            <span className="font-semibold">₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Delivery Fee:</span>
            <span>{Number(order.shippingFee) === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-bold text-slate-900">
            <span>Total:</span>
            <span className="text-blue-600">
              ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Cancel Order Action */}
      {order.orderStatus === 'PLACED' && (
        <div className="pt-2 text-right">
          <button
            onClick={handleCancelOrder}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition inline-flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            Cancel This Order
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
