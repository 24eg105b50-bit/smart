import React, { useState, useEffect } from 'react';
import { catalogApi } from '../../api/apiServices';
import { useCart } from '../../context/CartContext';
import RatingStars from '../../components/common/RatingStars';
import { Layers, X, Plus, ShoppingCart, Check } from 'lucide-react';

export const ComparePage = () => {
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogApi.getProducts({ size: 50 }).then((res) => {
      if (res.success && res.data?.content) {
        setAllProducts(res.data.content);
        // Default to comparing first 2 items
        if (res.data.content.length >= 2) {
          setSelectedIds([res.data.content[0].id, res.data.content[1].id]);
        }
      }
      setLoading(false);
    });
  }, []);

  const handleAddProduct = (e) => {
    const id = Number(e.target.value);
    if (id && !selectedIds.includes(id) && selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemove = (id) => {
    setSelectedIds(selectedIds.filter((pId) => pId !== id));
  };

  const comparedProducts = selectedIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            Product Comparison Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare technical specifications, prices, and stock across engineering supplies
          </p>
        </div>

        {/* Add Product Dropdown */}
        {selectedIds.length < 4 && (
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <select
              onChange={handleAddProduct}
              value=""
              className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled>
                + Add product to compare ({selectedIds.length}/4)
              </option>
              {allProducts
                .filter((p) => !selectedIds.includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {comparedProducts.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No products selected for comparison. Select up to 4 items from the dropdown above.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <tbody>
              {/* Product Overview Row */}
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="p-4 w-44 font-bold text-xs text-slate-500 uppercase">Product</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 align-top w-64 relative">
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 rounded-full hover:bg-slate-200"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300'}
                      alt={p.name}
                      className="w-24 h-24 object-cover rounded-lg mb-2 bg-slate-200"
                    />
                    <h3 className="font-semibold text-xs text-slate-900 line-clamp-2">{p.name}</h3>
                  </td>
                ))}
              </tr>

              {/* Price */}
              <tr className="border-b border-slate-100">
                <td className="p-4 font-bold text-xs text-slate-500 uppercase">Price</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 font-extrabold text-sm text-slate-900">
                    ₹{Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>

              {/* Brand */}
              <tr className="border-b border-slate-100">
                <td className="p-4 font-bold text-xs text-slate-500 uppercase">Brand</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs font-semibold text-blue-700">
                    {p.brand}
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr className="border-b border-slate-100">
                <td className="p-4 font-bold text-xs text-slate-500 uppercase">Category</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs text-slate-700">
                    {p.categoryName}
                  </td>
                ))}
              </tr>

              {/* Availability */}
              <tr className="border-b border-slate-100">
                <td className="p-4 font-bold text-xs text-slate-500 uppercase">Availability</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs font-medium">
                    {p.stockQuantity > 0 ? (
                      <span className="text-emerald-600 font-semibold">
                        In Stock ({p.stockQuantity} units)
                      </span>
                    ) : (
                      <span className="text-rose-500 font-semibold">Out of Stock</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr className="border-b border-slate-100">
                <td className="p-4 font-bold text-xs text-slate-500 uppercase">Rating</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4">
                    <RatingStars rating={p.averageRating} count={p.reviewCount} />
                  </td>
                ))}
              </tr>

              {/* SKU */}
              <tr className="border-b border-slate-100">
                <td className="p-4 font-bold text-xs text-slate-500 uppercase">SKU</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs font-mono text-slate-500">
                    {p.sku}
                  </td>
                ))}
              </tr>

              {/* Description */}
              <tr className="border-b border-slate-100">
                <td className="p-4 font-bold text-xs text-slate-500 uppercase">Specs / Details</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-xs text-slate-600 leading-relaxed">
                    {p.description}
                  </td>
                ))}
              </tr>

              {/* Add to Cart Actions */}
              <tr>
                <td className="p-4 font-bold text-xs text-slate-500 uppercase">Action</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4">
                    <button
                      onClick={() => addToCart(p.id, 1)}
                      disabled={p.stockQuantity <= 0}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
