import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi, catalogApi } from '../../api/apiServices';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const AdminProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await catalogApi.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
          if (!isEdit && res.data.length > 0) {
            setCategoryId(res.data[0].id.toString());
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadCategories();

    if (isEdit) {
      setLoading(true);
      catalogApi.getProductById(id).then((res) => {
        if (res.success && res.data) {
          const p = res.data;
          setCategoryId(p.categoryId ? p.categoryId.toString() : '');
          setName(p.name);
          setBrand(p.brand);
          setSku(p.sku);
          setPrice(p.price.toString());
          setStockQuantity(p.stockQuantity.toString());
          setDescription(p.description);
          setImageUrl(p.imageUrl || '');
          setActive(p.active);
        }
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        categoryId: Number(categoryId),
        name: name.trim(),
        brand: brand.trim(),
        sku: sku.trim().toUpperCase(),
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity, 10),
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        active: active,
      };

      if (isEdit) {
        await adminApi.updateProduct(id, payload);
      } else {
        await adminApi.createProduct(payload);
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading product details..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Products Inventory
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? 'Edit Catalog Product' : 'Add New Catalog Product'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isEdit ? 'Update product pricing, specifications, or stock' : 'Publish new academic supplies to campus catalog'}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            >
              <option value="" disabled>Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Brand / Publisher *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lenovo, Pearson, Logitech"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Product Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. ThinkPad E14 Gen 5 (Core i5, 16GB RAM)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">SKU Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. LEN-TP-E14"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Price (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="e.g. 54990.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Stock Quantity *</label>
            <input
              type="number"
              min="0"
              required
              placeholder="e.g. 15"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Image URL</label>
          <input
            type="url"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Technical Specifications & Course Description *</label>
          <textarea
            rows={4}
            required
            placeholder="Full technical details, syllabus relevance, semester lab usage..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="activeCheckbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label htmlFor="activeCheckbox" className="font-semibold text-slate-800">
            Active in campus catalog (visible to students)
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductFormPage;
