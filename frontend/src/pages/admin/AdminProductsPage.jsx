import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/apiServices';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Plus, Edit2, Trash2, Check, Package, Search } from 'lucide-react';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockVal, setNewStockVal] = useState('');

  const fetchProducts = async (page = 0) => {
    try {
      setLoading(true);
      const res = await adminApi.getProducts(page, 15);
      if (res.success && res.data) {
        setProducts(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(0);
  }, []);

  const handleUpdateStock = async (id) => {
    const parsed = parseInt(newStockVal, 10);
    if (isNaN(parsed) || parsed < 0) {
      alert('Please enter a valid non-negative stock count');
      return;
    }
    try {
      await adminApi.updateStock(id, parsed);
      setEditingStockId(null);
      fetchProducts(currentPage);
    } catch (err) {
      alert(err.message || 'Failed to update stock');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this product?')) return;
    try {
      await adminApi.deleteProduct(id);
      fetchProducts(currentPage);
    } catch (err) {
      alert(err.message || 'Failed to deactivate product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Product Catalog Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage catalog listings, prices, and warehouse inventory</p>
        </div>

        <Link
          to="/admin/products/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading product inventory..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[11px]">
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">{p.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{p.brand}</p>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600 font-medium">{p.categoryName}</td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-500">{p.sku}</td>

                    <td className="p-3.5 font-bold text-slate-900">
                      ₹{Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Stock with inline quick editing */}
                    <td className="p-3.5">
                      {editingStockId === p.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={newStockVal}
                            onChange={(e) => setNewStockVal(e.target.value)}
                            className="w-16 p-1 text-xs border border-blue-500 rounded-md"
                          />
                          <button
                            onClick={() => handleUpdateStock(p.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingStockId(p.id);
                            setNewStockVal(p.stockQuantity.toString());
                          }}
                          className="cursor-pointer hover:underline"
                          title="Click to edit stock"
                        >
                          <span
                            className={`font-semibold ${
                              p.stockQuantity <= 5 ? 'text-amber-600' : 'text-slate-800'
                            }`}
                          >
                            {p.stockQuantity} units
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {p.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right space-x-1">
                      <Link
                        to={`/admin/products/edit/${p.id}`}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-blue-50 inline-block"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeactivate(p.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md hover:bg-rose-50"
                        title="Deactivate Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => fetchProducts(page)}
          />
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
