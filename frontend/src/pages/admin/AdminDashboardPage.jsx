import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/apiServices';
import StatCard from '../../components/admin/StatCard';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboardStats().then((res) => {
      if (res.success && res.data) {
        setStats(res.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner text="Computing real-time store metrics..." />;
  if (!stats) return <div className="text-center p-12 text-slate-500">Failed to load statistics.</div>;

  const COLORS = ['#2563eb', '#6366f1', '#f59e0b', '#10b981', '#f43f5e'];

  return (
    <div className="space-y-8">
      {/* Top Banner & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campus Store Administration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics, inventory management, and fulfillment operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/products/new"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
          <Link
            to="/admin/orders"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Campus Revenue"
          value={`₹${Number(stats.totalRevenue).toLocaleString('en-IN')}`}
          icon={DollarSign}
          changeText="Calculated from non-cancelled orders"
          color="emerald"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          changeText={`${stats.pendingOrders} pending fulfillment`}
          color="blue"
        />
        <StatCard
          title="Active Products"
          value={stats.totalProducts}
          icon={Package}
          changeText={`${stats.lowStockProductsCount} low on stock`}
          color="indigo"
        />
        <StatCard
          title="Registered Students"
          value={stats.totalCustomers}
          icon={Users}
          changeText="Active campus student accounts"
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Fulfillment Status Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.salesByStatus}>
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Top In-Demand Academic Supplies</h2>
          <div className="space-y-3">
            {stats.topSellingProducts?.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">No sales records yet</p>
            ) : (
              stats.topSellingProducts?.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 line-clamp-1">{p.productName}</span>
                  </div>
                  <span className="font-bold text-slate-900">{p.soldCount} units sold</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tables Row: Low Stock Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Warnings (≤ 5 Units)
            </h2>
            <Link to="/admin/products" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {stats.lowStockProducts?.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No low stock items currently.</p>
            ) : (
              stats.lowStockProducts?.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 line-clamp-1">{p.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">SKU: {p.sku}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg text-xs">
                    {p.stockQuantity} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Customer Orders</h2>
            <Link to="/admin/orders" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {stats.recentOrders?.map((ord) => (
              <div key={ord.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{ord.orderNumber}</p>
                  <p className="text-[11px] text-slate-500">{ord.recipientName} • ₹{ord.totalAmount}</p>
                </div>
                <OrderStatusBadge status={ord.orderStatus} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
