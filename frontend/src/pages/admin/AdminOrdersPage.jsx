import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/apiServices';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  Package, 
  ExternalLink,
  ChevronDown,
  User,
  MapPin,
  Calendar
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';
import Pagination from '../../components/common/Pagination';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchOrders = async (page = 0) => {
    try {
      setLoading(true);
      const res = await adminApi.getOrders(page, 15);
      if (res.success && res.data) {
        setOrders(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
        setCurrentPage(res.data.number || 0);
      }
    } catch (err) {
      console.error('Failed to load admin orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await adminApi.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setActionSuccess(`Order #${orderId} updated to ${newStatus}`);
        setTimeout(() => setActionSuccess(''), 4000);
        
        // Update local list
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch = 
      order.id.toString().includes(searchQuery) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.userName && order.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.shippingAddress && order.shippingAddress.fullName && order.shippingAddress.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const statusOptions = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            Order Fulfillment Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage student campus orders, tracking IDs, and delivery workflows ({totalElements} total)
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, tracking or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', ...statusOptions].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <LoadingSpinner text="Loading orders..." />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No orders found"
          message={searchQuery ? 'No orders match your search criteria.' : 'No orders in this status category.'}
          actionLabel="Reset Filters"
          onAction={() => { setStatusFilter('ALL'); setSearchQuery(''); }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Student Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-blue-600" />
                        #{order.id}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {order.trackingNumber || 'PENDING'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {order.shippingAddress?.fullName || 'Campus Student'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.shippingAddress?.campusHostel || order.shippingAddress?.city || 'Campus Delivery'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Ph: {order.shippingAddress?.phoneNumber || 'N/A'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">
                        {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                      </div>
                      <div className="text-[11px] text-slate-400 max-w-[180px] truncate">
                        {order.items?.[0]?.productTitle}
                        {(order.items?.length || 0) > 1 && ` +${order.items.length - 1} more`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="text-[10px] text-emerald-600 font-medium">
                          Saved ₹{Number(order.discountAmount).toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {order.paymentMethod || 'COD'}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {order.paymentStatus || 'COMPLETED'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <OrderStatusBadge status={order.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status Change Selector */}
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 font-medium text-slate-700 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                          {statusOptions.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>

                        {/* View Order Detail Modal Trigger */}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-scaleUp">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Order Details #{selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Status and Tracking */}
              <div className="flex flex-wrap items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200 gap-2">
                <div>
                  <div className="text-slate-500 text-[11px]">Current Fulfillment Status</div>
                  <div className="mt-1">
                    <OrderStatusBadge status={selectedOrder.status} />
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">Campus Tracking Number</div>
                  <div className="font-mono font-bold text-slate-800 mt-1">
                    {selectedOrder.trackingNumber || 'NOT GENERATED'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">Payment Mode</div>
                  <div className="font-semibold text-slate-800 mt-1">
                    {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-blue-600" /> Delivery Address
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900">{selectedOrder.shippingAddress?.fullName}</p>
                  <p>{selectedOrder.shippingAddress?.campusHostel || selectedOrder.shippingAddress?.streetAddress}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}</p>
                  <p className="text-slate-500 mt-1 font-mono">Phone: {selectedOrder.shippingAddress?.phoneNumber}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5 text-sm">
                  <Package className="w-4 h-4 text-blue-600" /> Purchased Items ({selectedOrder.items?.length || 0})
                </h4>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                          alt={item.productTitle}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{item.productTitle}</p>
                          <p className="text-slate-400 text-[11px]">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">
                        ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{Number(selectedOrder.subtotal || selectedOrder.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Student Discount Applied</span>
                    <span>-₹{Number(selectedOrder.discountAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span>₹0 (Free Campus Delivery)</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                  <span>Total Grand Amount</span>
                  <span>₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Change Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 font-medium text-slate-700"
                >
                  {statusOptions.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
