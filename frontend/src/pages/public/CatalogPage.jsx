import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { catalogApi } from '../../api/apiServices';
import ProductCard from '../../components/product/ProductCard';
import ProductFilters from '../../components/product/ProductFilters';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter state synced with query params
  const categoryIdParam = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null;
  const keywordParam = searchParams.get('keyword') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const pageParam = Number(searchParams.get('page')) || 0;
  const sortByParam = searchParams.get('sortBy') || 'createdAt';
  const sortDirParam = searchParams.get('sortDir') || 'desc';

  useEffect(() => {
    catalogApi.getCategories().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const params = {
          categoryId: categoryIdParam || undefined,
          keyword: keywordParam || undefined,
          minPrice: minPriceParam || undefined,
          maxPrice: maxPriceParam || undefined,
          page: pageParam,
          size: 12,
          sortBy: sortByParam,
          sortDir: sortDirParam,
        };

        const res = await catalogApi.getProducts(params);
        if (res.success && res.data) {
          setProducts(res.data.content || []);
          setTotalPages(res.data.totalPages || 0);
          setTotalElements(res.data.totalElements || 0);
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [categoryIdParam, keywordParam, minPriceParam, maxPriceParam, pageParam, sortByParam, sortDirParam]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== null && value !== undefined && value !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '0'); // Reset to page 0 on filter change
    setSearchParams(newParams);
  };

  const handlePriceChange = (min, max) => {
    const newParams = new URLSearchParams(searchParams);
    if (min) newParams.set('minPrice', min); else newParams.delete('minPrice');
    if (max) newParams.set('maxPrice', max); else newParams.delete('maxPrice');
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    const [sortBy, sortDir] = val.split('-');
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', sortBy);
    newParams.set('sortDir', sortDir);
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header & Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campus Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {totalElements} student verified academic and engineering supplies
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <select
            value={`${sortByParam}-${sortDirParam}`}
            onChange={handleSortChange}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="createdAt-desc">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="averageRating-desc">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Main Grid Layout: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilters
            categories={categories}
            selectedCategory={categoryIdParam}
            onSelectCategory={(id) => updateParam('categoryId', id)}
            minPrice={minPriceParam}
            maxPrice={maxPriceParam}
            onPriceChange={handlePriceChange}
            keyword={keywordParam}
            onKeywordChange={(kw) => updateParam('keyword', kw)}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Products Results */}
        <div className="lg:col-span-3">
          {loading ? (
            <LoadingSpinner text="Searching products..." />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products matched your criteria"
              description="Try clearing your filters or searching for terms like 'laptop', 'CLRS', 'keyboard', or 'Arduino'."
              actionText="Reset All Filters"
              actionLink="/catalog"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              <Pagination
                currentPage={pageParam}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
