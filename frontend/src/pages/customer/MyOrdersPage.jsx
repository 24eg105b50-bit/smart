import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/apiServices';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Package, ArrowRight, XCircle } from 'lucide-react';

export const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getMyOrders();
      if (res.success && res.data?.content) {
        setOrders(res.data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this placed order? Items will be restored to store inventory.')) {
      return;
    }
    try {
      const res = await orderApi.cancelOrder(orderId);
      if (res.success) {
        fetchOrders();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    }
  };

  if (loading) return <LoadingSpinner text="Loading your orders..." />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders placed yet"
        description="When you order course textbooks, laptops, or electronics, your orders will appear here."
        actionText="Explore Campus Catalog"
        actionLink="/catalog"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          My Orders & Campus Deliveries
        </h1>
        <p className="text-xs text-slate-500 mt-1">Track your past purchases and delivery statuses</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-slate-900">
                  {order.orderNumber}
                </span>
                <OrderStatusBadge status={order.orderStatus} />
              </div>
              <span className="text-xs text-slate-400">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Items summary */}
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-slate-700">
                  <span>
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-semibold text-slate-900">
                    ₹{Number(item.lineTotal).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 mr-2">Total Amount:</span>
                <span className="text-base font-bold text-slate-900">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {order.orderStatus === 'PLACED' && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel Order
                  </button>
                )}
                <Link
                  to={`/orders/${order.id}`}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1"
                >
                  View Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrdersPage;
